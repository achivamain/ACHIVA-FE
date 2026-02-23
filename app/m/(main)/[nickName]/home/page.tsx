import { auth } from "@/auth";
import Logout from "@/components/Logout";
import { MyCategorys } from "@/features/home/MyCategorys";
import MyRecordArchive from "@/features/home/MyRecordArchive";
import { User } from "@/types/User";
import { notFound, redirect } from "next/navigation";
import { CategoryCharCount, CategoryCount } from "@/types/Post";

export default async function MobileHomePageRoute({
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

  const { nickName } = await params; // 이 페이지 유저 닉네임, 추후 API 사용을 위해

  async function getUser() {
    // 유저 데이터 가져오기
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
      const errorData = await res.json().catch(() => ({}));
      return redirect("/api/auth/logout");
      throw new Error(errorData.error || "서버 오류");
    }
    const { data } = await res.json();
    if (!data) {
      throw new Error("Invaild user data");
    }
    return data as User;
  }

  const [user] = await Promise.all([getUser()]);

  //카테고리별 게시물 수 받아오기
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
      throw new Error("Invaild post counts of categories data");
    }
    const { categoryCounts } = data;
    return categoryCounts as CategoryCount[];
  }

  //카테고리별 글자수 받아오기
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
      throw new Error("Invaild character counts of categories data");
    }
    const { categoryCharacterCounts } = data;
    return categoryCharacterCounts as CategoryCharCount[];
  }

  try {
    const [categoryCounts, categoryCharCounts] = await Promise.all([
      getPostCategory(),
      getCategorysCharCount(),
    ]);
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
    notFound(); // 에러 종류에 따라 처리를 나눌 필요가 있을지도
  }
}
