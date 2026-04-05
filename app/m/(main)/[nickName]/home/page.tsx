import Logout from "@/components/Logout";
import { MyCategorys } from "@/features/home/MyCategorys";
import HomeRecordCalendar from "@/features/home/HomeRecordCalendar";
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
  const user = await getMe(token).catch(() => null);
  if (!user) notFound();
  if (user.nickName !== decodeURIComponent(nickName)) {
    redirect(`/${nickName}`);
  }

  try {
    const {
      categoryCounts,
      weeklyCategoryCounts,
      categoryCharCounts,
      weeklyArticleCount,
      streakWeeks,
    } = await getHomeData(user.id, token);

    return (
      <div className="min-h-dvh w-full pb-[104px] flex flex-col">
        <div className="px-5 py-5 flex items-end justify-between">
          <h1 className="text-[22px] font-black tracking-tight text-gray-900 leading-none">
            🏠 홈
          </h1>
        </div>
        <MyCategorys
          myCategories={user.categories}
          categoryCounts={categoryCounts}
          weeklyCategoryCounts={weeklyCategoryCounts}
          categoryCharCounts={categoryCharCounts}
        />
        <div className="h-6" />
        <HomeRecordCalendar userId={user.id} />
        <div className="h-6" />
        <MyAchievementsSummary
          totalCount={user.articleCount}
          streakWeeks={streakWeeks}
          thisWeekCount={weeklyArticleCount}
        />
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
