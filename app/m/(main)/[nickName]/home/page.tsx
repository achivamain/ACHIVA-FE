import { auth } from "@/auth";
import Logout from "@/components/Logout";
import MobileGoalSummary from "@/features/home/ProfileSummary";
import { MyCategorys } from "@/features/home/MyCategorys";
import { User } from "@/types/User";
import { notFound, redirect } from "next/navigation";
import { CategoryCharCount, CategoryCount } from "@/types/Post";
import { NextResponse } from "next/server";

export default async function MobileHomePageRoute({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const { nickName } = await params; // 이 페이지 유저 닉네임, 추후 API 사용을 위해

  async function getUser() {
    // 유저 데이터 가져오기
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api2/members/${nickName}`,
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
      return redirect("/api/auth/logout");
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invaild user data");
    }
    return data as User;
  }

  const [user] = await Promise.all([getUser()]);

  //카테고리별 게시물 수 받아오기
  async function getPostCategory() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/{memberId}/count-by-category?memberId=${user.id}`,
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
      throw new Error("Invaild post counts of categories data");
    }
    const { categoryCounts } = data;
    return categoryCounts as CategoryCount[];
  }

  //카테고리별 글자수 받아오기
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
      throw new Error("Invaild character counts of categories data");
    }
    const { categoryCharacterCounts } = data;
    return categoryCharacterCounts as CategoryCharCount[];
  }

  //홈 하단 데이터(총 글자수, 보낸 응원 포인트, 목표 포인트)
  async function getSummeryData() {
    try {
      // 총 글자수
      const charRes = fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/my-total-character-count`,
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
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/me/cheerings/total-sending-score`,
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
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals/my-total-click-count`,
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
          throw new Error(`데이터 로딩 실패 (${res.status})`);
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
      throw new Error(`데이터 처리 실패: ${err}`);
    }
  }

  try {
    const [categoryCounts, mySummaryData, categoryCharCounts] =
      await Promise.all([
        getPostCategory(),
        getSummeryData(),
        getCategorysCharCount(),
      ]);
    return (
      <div className="min-h-dvh w-full bg-[#F9F9F9] pb-[104px] flex flex-col">
        <MyCategorys
          myCategories={user.categories}
          categoryCounts={categoryCounts}
          categoryCharCounts={categoryCharCounts}
        />
        <div className="h-30">{/* 배너? */}</div>
        <h1 className="text-[26px] font-semibold mx-5 mb-3">올해의 기록</h1>
        <MobileGoalSummary summaryData={mySummaryData} />
      </div>
    );
  } catch (err) {
    console.error(err);
    notFound(); // 에러 종류에 따라 처리를 나눌 필요가 있을지도
  }
}
