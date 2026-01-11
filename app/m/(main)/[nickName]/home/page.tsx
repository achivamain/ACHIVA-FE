import { auth } from "@/auth";
import Logout from "@/components/Logout";
import MobileGoalSummary from "@/features/user/goals/GoalSummary";
import { MyCategorys } from "@/features/home/MyCategorys";
import { User } from "@/types/User";
import { notFound } from "next/navigation";
import { CategoryCount } from "@/types/Post";
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api2/members/${nickName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data } = await response.json();
    if (!data) {
      notFound();
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
      }
    );
    const { data } = await res.json();
    if (!data) {
      notFound();
    }
    const { categoryCounts } = data;
    return categoryCounts as CategoryCount[];
  }

  const [categoryCounts] = await Promise.all([getPostCategory()]);

  const mySummaryData = {
    letters: 20,
    count: 125,
    points: 1700,
  };

  return (
    <div className="min-h-dvh w-full bg-[#F9F9F9] pb-[104px] flex flex-col">
      <MyCategorys myCategories={user.categories} categoryCounts={categoryCounts}/>
      <MobileGoalSummary summaryData={mySummaryData} />
    </div>
  );
}
