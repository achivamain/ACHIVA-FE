// 서버에서만 실행
// 에러명을 잘 짓고 싶다...

import { notFound } from "next/navigation";
import { endOfWeek, format, parseISO, startOfWeek, subWeeks } from "date-fns";
import { CategoryCharCount, CategoryCount, PostRes } from "@/types/Post";
import type { PostsData } from "@/types/responses";

const PROJECT_START_DATE = "2025-01-01T00:00:00";
const MEMBER_POSTS_PAGE_SIZE = 100;

function toDateTimeParam(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

function toWeekKey(date: Date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export async function getPostData(postId: string, token: string) {
  async function getPost() {
    const postRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${postId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const postData = await postRes.json();

    if (postData.code === 2000) {
      throw new Error("게시물이 존재하지 않습니다");
    }
    return postData;
  }

  async function getCheering() {
    const cheeringRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${postId}/cheerings`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const cheeringData = await cheeringRes.json();
    if (!cheeringData.data) {
      throw new Error("게시물이 존재하지 않습니다");
    }
    return cheeringData;
  }
  try {
    const [postData, cheeringData] = await Promise.all([
      getPost(),
      getCheering(),
    ]);

    const data: PostRes = {
      ...postData.data,
      cheerings: cheeringData.data.content,
    };

    return data;
  } catch (err) {
    console.error("Server Error: ", err);
    notFound();
  }
}

// 홈 하단 데이터(총 글자수, 보낸 응원 포인트, 목표 포인트)
async function getSummaryData(token: string) {
  try {
    // 검색 기간을 올해로 지정
    const startDate = `${new Date().getFullYear()}-01-01T00:00:00`;

    // 총 글자수
    const charRes = fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/my-total-character-count?startDate=${startDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // 보낸 응원 포인트
    const cheerRes = fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/me/cheerings/total-sending-score?startDate=${startDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // 목표 포인트
    const goalRes = fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals/my-total-click-count?startDate=${startDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responses = await Promise.all([charRes, cheerRes, goalRes]);
    responses.forEach((res) => {
      if (!res.ok) {
        throw new Error(`서버 오류 (${res.status})`);
      }
    });
    const [charData, cheerData, goalData] = await Promise.all(
      responses.map((res) => res.json()),
    );

    return {
      letters: charData.data.totalCharacterCount,
      count: goalData.data.totalClickCount,
      points: cheerData.data.totalSendingCheeringScore,
    };
  } catch (err) {
    console.error("Error in fetch summary data: ", err);
    throw new Error(`Error in fetch summary data: ${err}`);
  }
}

// /[nickName]
export async function getSummeryData(token: string) {
  const [mySummaryData] = await Promise.all([getSummaryData(token)]);

  return { mySummaryData };
}

// /[nickName]/home
export async function getHomeData(userId: string, token: string) {
  async function getArticleCount(startDate: string, endDate: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${userId}/count?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error in fetch article count: ", errorData);
      throw new Error(errorData.error || "서버 오류");
    }

    const { data } = await res.json();
    if (!data || typeof data.articleCount !== "number") {
      throw new Error("Invalid article count data");
    }

    return data.articleCount as number;
  }

  async function getStreakWeeks() {
    const projectStart = parseISO(PROJECT_START_DATE);
    const activeWeekKeys = new Set<string>();
    let page = 0;

    while (true) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/member/${userId}/articles?page=${page}&size=${MEMBER_POSTS_PAGE_SIZE}&sort=createdAt,DESC`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error in fetch posts for streak weeks: ", errorData);
        throw new Error(errorData.error || "서버 오류");
      }

      const json = await res.json();
      const data = json.data as PostsData;
      const posts = data?.content ?? [];

      if (posts.length === 0) {
        break;
      }

      let reachedProjectStart = false;

      for (const post of posts) {
        const createdAt = parseISO(post.createdAt);

        if (createdAt < projectStart) {
          reachedProjectStart = true;
          break;
        }

        activeWeekKeys.add(toWeekKey(createdAt));
      }

      if (reachedProjectStart || data.last) {
        break;
      }

      page += 1;
    }

    let streakWeeks = 0;
    let cursorWeekStart = subWeeks(
      startOfWeek(new Date(), { weekStartsOn: 1 }),
      1,
    );

    while (activeWeekKeys.has(format(cursorWeekStart, "yyyy-MM-dd"))) {
      streakWeeks += 1;
      cursorWeekStart = subWeeks(cursorWeekStart, 1);
    }

    return streakWeeks;
  }

  // 카테고리별 게시물 수 받아오기
  async function getPostCategory() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/{memberId}/count-by-category?memberId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error in fetch post counts of categories: ", errorData);
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid post counts of categories data");
    }
    const { categoryCounts } = data;
    return categoryCounts as CategoryCount[];
  }

  async function getWeeklyPostCategory() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/{memberId}/weekly-count-by-category?memberId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error in fetch weekly post counts of categories: ", errorData);
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid weekly post counts of categories data");
    }
    const { categoryCounts } = data;
    return categoryCounts as CategoryCount[];
  }

  // 카테고리별 글자수 받아오기
  async function getCategorysCharCount() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/my-character-count-by-category`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(
        "Error in fetch character counts of categories: ",
        errorData,
      );
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid character counts of categories data");
    }
    const { categoryCharacterCounts } = data;
    return categoryCharacterCounts as CategoryCharCount[];
  }

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [
    categoryCounts,
    weeklyCategoryCounts,
    mySummaryData,
    categoryCharCounts,
    totalArticleCount,
    weeklyArticleCount,
    streakWeeks,
  ] = await Promise.all(
    [
      getPostCategory(),
      getWeeklyPostCategory(),
      getSummaryData(token),
      getCategorysCharCount(),
      getArticleCount(PROJECT_START_DATE, toDateTimeParam(now)),
      getArticleCount(toDateTimeParam(weekStart), toDateTimeParam(weekEnd)),
      getStreakWeeks(),
    ],
  );

  return {
    categoryCounts,
    weeklyCategoryCounts,
    mySummaryData,
    categoryCharCounts,
    totalArticleCount,
    weeklyArticleCount,
    streakWeeks,
  };
}
