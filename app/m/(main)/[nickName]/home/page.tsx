import Logout from "@/components/Logout";
import { MyCategorys } from "@/features/home/MyCategorys";
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

  try {
    const user = await getMe(token);
    if (!(user.nickName === decodeURIComponent(nickName))) {
      redirect(`/${nickName}`);
    }
    const { categoryCounts, categoryCharCounts } =
      await getHomeData(user.id, token);
    return (
      <div className="min-h-dvh w-full bg-[#F9F9F9] pb-[104px] flex flex-col">
        <MyCategorys
          myCategories={user.categories}
          categoryCounts={categoryCounts}
          categoryCharCounts={categoryCharCounts}
        />
        <MyRecordArchive userId={user.id} />
        <div className="h-10"></div>
      </div>
    );
  } catch (err) {
    console.error(err);
    notFound();
  }
}
