import { WebProfileSummary } from "@/features/home/ProfileSummary";
import Footer from "@/components/Footer";
import Banner from "@/features/event/Banner";
import { notFound, redirect } from "next/navigation";
import { MyCategorys } from "@/features/home/MyCategorys";
import Logout from "@/components/Logout";
import { getHomeData } from "@/lib/getData";
import { getAuthSession } from "@/lib/getAuthSession";
import { getMe } from "@/lib/getUser";

export default async function HomePage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const { nickName } = await params;

  try {
    const user = await getMe(token);
    if (!(user.nickName === decodeURIComponent(nickName))){
      redirect(`/${nickName}`);
    }

    const { categoryCounts, mySummaryData, categoryCharCounts } =
      await getHomeData(user.id, token);
    return (
      <div className="w-full flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[844px]">
              <MyCategorys
                myCategories={user.categories}
                categoryCounts={categoryCounts}
                categoryCharCounts={categoryCharCounts}
              />
              <div className="h-10"></div>
              <WebProfileSummary summaryData={mySummaryData} />
            </div>
          </div>
          <Footer />
        </div>
        <div className="bg-[#fafafa] w-60 hidden md:flex justify-center">
          <Banner />
        </div>
      </div>
    );
  } catch (err) {
    console.error(err);
    notFound(); // 에러 종류에 따라 처리를 나눌 필요가 있을지도
  }
}
