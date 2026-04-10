import Banner from "@/features/event/Banner";
import { notFound, redirect } from "next/navigation";
import { MyCategorys } from "@/features/home/MyCategorys";
import HomeRecordCalendar from "@/features/home/HomeRecordCalendar";
import MyRecordArchive from "@/features/home/MyRecordArchive";
import Logout from "@/components/Logout";
import { getHomeData } from "@/lib/getData";
import { getAuthSession } from "@/lib/getAuthSession";
import { getMe, isOwner } from "@/lib/getUser";

export default async function HomePage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const { nickName } = await params;
  const user = await getMe(token).catch(() => null);
  if (!user) notFound();

  if (!(await isOwner(nickName, token))) {
    redirect(`/${nickName}`);
  }

  try {
    const {
      categoryCounts,
      weeklyCategoryCounts,
      categoryCharCounts,
    } = await getHomeData(user.id, token);

    return (
      <div className="w-full flex-1 flex bg-[#FAFAFA]">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[844px]">
              <div className="pt-[80px] pb-5 px-5">
                <h2 className="text-[28px] font-extrabold text-[#3A2418]">
                  안녕하세요, {decodeURIComponent(nickName)} 님! ✨
                </h2>
                <p className="text-[16px] leading-[22px] text-[#8A7565] mt-2">
                  오늘도 은혜가 풍성한 하루 되시기를 축복합니다!
                </p>
              </div>
              <MyCategorys
                categoryCounts={categoryCounts}
                weeklyCategoryCounts={weeklyCategoryCounts}
                categoryCharCounts={categoryCharCounts}
              />
              <div className="h-8"></div>
              <HomeRecordCalendar userId={user.id} />
              <div className="h-6"></div>
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
