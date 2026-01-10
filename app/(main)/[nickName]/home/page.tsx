import { auth } from "@/auth";
import Logout from "@/components/Logout";
import WebGoalSummary from "@/features/user/goals/GoalSummary";
import Footer from "@/components/Footer";
import Banner from "@/features/event/Banner";
import { User } from "@/types/User";
import { notFound } from "next/navigation";
import { MyCategorys } from "@/features/home/MyCategorys";

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

  // 나중에 API로 받아와야 함
  const mySummaryData = {
    letters: 20,
    count: 125,
    points: 1700,
  };

  return (
    <div className="w-full flex-1 flex">
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex-1 flex justify-center items-end">
          <div className="w-full h-full max-w-[844px]">
            <MyCategorys myCategories={user.categories} />
            <div className="h-[10%]"></div>
            <WebGoalSummary summaryData={mySummaryData} />
          </div>
        </div>
        {/* Footer 크기 디자인 따라서 다름 -> 문의해봐야 */}
        <Footer />
      </div>
      <div className="bg-[#fafafa] w-60 hidden md:flex justify-center">
        <Banner />
      </div>
    </div>
  );
}
