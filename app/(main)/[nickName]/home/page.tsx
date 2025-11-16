import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import GoalSummary from "@/features/user/goals/GoalSummary";
import Footer from "@/components/Footer";
import Banner from "@/features/event/Banner";
import { CaretRight24pxIcon } from "@/components/Icons";

export default async function HomePage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }

  const { nickName } = await params; // 이 페이지 유저 닉네임, 추후 API 사용을 위해

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
          <div className="w-full max-w-[844px]">
            {/* 나중에 책 관련 추가될 부분 */}
            <GoalSummary summaryData={mySummaryData} />
          </div>
        </div>

        <div className="flex justify-center py-6">
          <Link
            href="/post/create"
            className="flex flex-row justify-center items-center gap-1 w-[272px] h-14 px-12 bg-[#412A2A] rounded-[64px]"
          >
            <span className="font-['Pretendard'] font-semibold text-xl leading-6 text-white text-center">
              오늘의 이야기 작성
            </span>
            <CaretRight24pxIcon />
          </Link>
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
