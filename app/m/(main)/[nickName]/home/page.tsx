import Logout from "@/components/Logout";
import { Category } from "@/types/Categories";
import { MyCategorys } from "@/features/home/MyCategorys";
import HomeWeeklyPlanner from "@/features/home/HomeWeeklyPlanner";
import MyRecordArchive from "@/features/home/MyRecordArchive";
import MyAchievementsSummary from "@/features/home/MyAchievementsSummary";
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

  const user = await getMe(token);
  if (!(user.nickName === decodeURIComponent(nickName))) {
    redirect(`/${nickName}`);
  }

  try {
    const { categoryCounts, weeklyCategoryCounts, categoryCharCounts } = await getHomeData(
      user.id,
      token,
    );
    const totalCount = categoryCounts.reduce((sum, c) => sum + c.count, 0);
    const thisWeekCount = weeklyCategoryCounts.reduce((sum, c) => sum + c.count, 0);
    return (
      <div className="min-h-dvh w-full bg-[#F9F9F9] pb-[104px] flex flex-col">
        <MyCategorys
          myCategories={user.categories}
          categoryCounts={categoryCounts}
          weeklyCategoryCounts={weeklyCategoryCounts}
          categoryCharCounts={categoryCharCounts}
        />
        <div className="h-4" />
        <HomeWeeklyPlanner
          userId={user.id}
          categories={user.categories as Category[]}
          categoryCounts={categoryCounts}
        />
        <div className="h-6" />
        <MyAchievementsSummary totalCount={totalCount} thisWeekCount={thisWeekCount} />
        <div className="h-6" />
        <MyRecordArchive userId={user.id} />
        <div className="h-10"></div>
      </div>
    );
  } catch (err) {
    console.error(err);
    notFound();
  }
}
