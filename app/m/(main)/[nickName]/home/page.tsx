import Logout from "@/components/Logout";
import MobileGoalSummary from "@/features/home/ProfileSummary";
import { MyCategorys } from "@/features/home/MyCategorys";
import { getAuthSession } from "@/lib/getAuthSession";
import { getHomeData } from "@/lib/getData";
import { notFound, redirect } from "next/navigation";
import { getMe } from "@/lib/getUser";

export default async function MobileHomePageRoute({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const { nickName } = await params;

  try {
    const user = await getMe(token);
    if (!(user.nickName === decodeURIComponent(nickName))) {
      redirect(`/${nickName}`);
    }
    const { categoryCounts, mySummaryData, categoryCharCounts } =
      await getHomeData(user.id, token);
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
