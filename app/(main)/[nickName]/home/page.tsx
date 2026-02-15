import { auth } from "@/auth";
import Logout from "@/components/Logout";
import Banner from "@/features/event/Banner";
import { User } from "@/types/User";
import { notFound, redirect } from "next/navigation";
import { MyCategorys } from "@/features/home/MyCategorys";
import MyRecordArchive from "@/features/home/MyRecordArchive";
import { CategoryCharCount, CategoryCount } from "@/types/Post";

export default async function HomePage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  const token = session?.access_token;

  if (!token) {
    redirect("/api/auth/logout");
  }

  const { nickName } = await params;

  // 유저 데이터 가져오기
  async function getUser() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api2/members/${nickName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      redirect("/api/auth/logout");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid user data");
    }
    return data as User;
  }

  const [user] = await Promise.all([getUser()]);

  // 카테고리별 게시물 수 받아오기
  async function getPostCategory() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/{memberId}/count-by-category?memberId=${user.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid post counts of categories data");
    }
    const { categoryCounts } = data;
    return categoryCounts as CategoryCount[];
  }

  // 카테고리별 글자수 받아오기
  async function getCategorysCharCount() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/my-character-count-by-category`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invalid character counts of categories data");
    }
    const { categoryCharacterCounts } = data;
    return categoryCharacterCounts as CategoryCharCount[];
  }

  try {
    const [categoryCounts, categoryCharCounts] =
      await Promise.all([
        getPostCategory(),
        getCategorysCharCount(),
      ]);
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
              <MyCategorys
                myCategories={user.categories}
                categoryCounts={categoryCounts}
                categoryCharCounts={categoryCharCounts}
              />
              <div className="h-10"></div>
              {/* 나의 기록 보관소 */}
              <MyRecordArchive userId={user.id} />
              <div className="h-10"></div>
            </div>
          </div>
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
