import { auth } from "@/auth";
import Logout from "@/components/Logout";
import { WebProfileSummary } from "@/features/home/ProfileSummary";
import Footer from "@/components/Footer";
import Banner from "@/features/event/Banner";
import { User } from "@/types/User";
import { notFound, redirect } from "next/navigation";
import { MyCategorys } from "@/features/home/MyCategorys";
import { CategoryCharCount, CategoryCount } from "@/types/Post";

export default async function HomePage({
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
    redirect("/api/auth/logout");
  }

  const { nickName } = await params;

  // 유저 데이터 가져오기
  async function getUser() {
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
      redirect("/api/auth/logout");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid user data");
    }
    return data as User;
  }

  const [user] = await Promise.all([getUser()]);

  // 카테고리별 게시물 수 받아오기
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
      console.error("Error in fetch summary data: ", err);
      throw new Error(`Error in fetch summary data: ${err}`);
    }
  }

  try {
    const [categoryCounts, mySummaryData, categoryCharCounts] =
      await Promise.all([
        getPostCategory(),
        getSummaryData(),
        getCategorysCharCount(),
      ]);
    return (
      <div className="w-full flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex justify-center items-end">
            <div className="w-full max-w-[844px]">
              <MyCategorys
                myCategories={user.categories}
                categoryCounts={categoryCounts}
                categoryCharCounts={categoryCharCounts}
              />
              <div className="h-10"></div>
              <WebProfileSummary summaryData={mySummaryData} />
            </div>
          </div>
          <Footer />
        </div>
        <div className="bg-[#fafafa] w-60 hidden md:flex justify-center">
          <Banner />
        </div>
      </div>
    );
  } catch (err) {
    console.error(err);
    notFound(); // 에러 종류에 따라 처리를 나눌 필요가 있을지도
  }
}
