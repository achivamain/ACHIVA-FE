import Logout from "@/components/Logout";
import { MyCategorys } from "@/features/home/MyCategorys";
import HomeRecordCalendar from "@/features/home/HomeRecordCalendar";
import MyRecordArchive from "@/features/home/MyRecordArchive";
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
    } = await getHomeData(user.id, token);

    return (
      <div className="min-h-dvh w-full pb-[104px] flex flex-col">
        <div className="pt-6 pb-2 px-5">
          <h2 className="text-[24px] font-extrabold text-[#3A2418]">
            안녕하세요, {decodeURIComponent(nickName)} 님! ✨
          </h2>
          <p className="text-[14px] leading-[20px] text-[#8A7565] mt-1.5">
            오늘도 은혜가 풍성한 하루 되시기를 축복합니다!
          </p>
        </div>
        <div className="h-4" />
        <MyCategorys
          categoryCounts={categoryCounts}
          weeklyCategoryCounts={weeklyCategoryCounts}
          categoryCharCounts={categoryCharCounts}
        />
        <div className="h-6" />
        <HomeRecordCalendar userId={user.id} />
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
