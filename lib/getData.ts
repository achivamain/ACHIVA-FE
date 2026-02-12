// 서버에서만 실행
// 에러명을 잘 짓고 싶다...

import { notFound } from "next/navigation";
import { CategoryCharCount, CategoryCount, PostRes } from "@/types/Post";

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
  } catch {
    notFound();
  }
}

// /[nickName]/home
export async function getHomeData(userId: string, token: string) {
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
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid post counts of categories data");
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
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid character counts of categories data");
    }
    const { categoryCharacterCounts } = data;
    return categoryCharacterCounts as CategoryCharCount[];
  }

  // 홈 하단 데이터(총 글자수, 보낸 응원 포인트, 목표 포인트)
  async function getSummaryData() {
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

  const [categoryCounts, mySummaryData, categoryCharCounts] = await Promise.all(
    [getPostCategory(), getSummaryData(), getCategorysCharCount()],
  );

  return { categoryCounts, mySummaryData, categoryCharCounts };
}
