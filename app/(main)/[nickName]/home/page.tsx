import Banner from "@/features/event/Banner";
import { Category } from "@/types/Categories";
import { notFound } from "next/navigation";
import { MyCategorys } from "@/features/home/MyCategorys";
import HomeWeeklyPlanner from "@/features/home/HomeWeeklyPlanner";
import MyAchievementsSummary from "@/features/home/MyAchievementsSummary";
import MyRecordArchive from "@/features/home/MyRecordArchive";
import LiveActivityTicker from "@/features/home/LiveActivityTicker";
import Logout from "@/components/Logout";
import { getHomeData } from "@/lib/getData";
import { getAuthSession } from "@/lib/getAuthSession";
import { getUser } from "@/lib/getUser";
import AiReportWidget from "@/features/home/AiReportWidget";

export default async function HomePage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const { nickName } = await params;
  const user = await getUser(nickName, token).catch(() => null);
  if (!user) notFound();

  try {
    const {
      categoryCounts,
      weeklyCategoryCounts,
      categoryCharCounts,
      weeklyArticleCount,
      streakWeeks,
    } = await getHomeData(user.id, token);

    return (
      <div className="w-full flex-1 flex bg-[#FAFAFA]">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[844px]">
              <div className="pt-15 pb-3 px-5">
                <h2 className="text-[28px] font-extrabold text-black">
                  안녕하세요, {decodeURIComponent(nickName)} 님! 👍
                </h2>
                <p className="text-[16px] leading-[22px] text-[#8E95A9] mt-1">
                  오늘도 열심히 운동하는 당신을 응원합니다!
                </p>
              </div>
              <LiveActivityTicker />
              <MyCategorys
                myCategories={user.categories}
                categoryCounts={categoryCounts}
                weeklyCategoryCounts={weeklyCategoryCounts}
                categoryCharCounts={categoryCharCounts}
              />
              <div className="h-8"></div>
              <HomeWeeklyPlanner
                userId={user.id}
                categories={user.categories as Category[]}
                categoryCounts={categoryCounts}
              />
              <div className="h-6"></div>
              <MyAchievementsSummary
                userId={user.id}
                totalCount={user.articleCount}
                streakWeeks={streakWeeks}
                thisWeekCount={weeklyArticleCount}
              />
              <div className="h-6"></div>
              <AiReportWidget userId={user.id} />
              <div className="h-10"></div>
              <MyRecordArchive userId={user.id} />
              <div className="h-10"></div>
            </div>
          </div>
        </div>
        <div className="bg-[#fafafa] w-[320px] hidden md:flex justify-center">
          <Banner />
        </div>
      </div>
    );
  } catch (err) {
    console.error(err);
    notFound();
  }
}
