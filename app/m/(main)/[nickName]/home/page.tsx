import Logout from "@/components/Logout";
import { Category } from "@/types/Categories";
import { MyCategorys } from "@/features/home/MyCategorys";
import MyRecordArchive from "@/features/home/MyRecordArchive";
import AiReportWidget from "@/features/home/AiReportWidget";
import { getAuthSession } from "@/lib/getAuthSession";
import { getHomeData } from "@/lib/getData";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/getUser";

export default async function MobileHomePageRoute({
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
          categoryCharCounts={categoryCharCounts}
        />
        <div className="h-4" />
        <div className="h-5" />
        <AiReportWidget userId={user.id} />
        <div className="h-6" />
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
