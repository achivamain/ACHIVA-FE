import { auth } from "@/auth";
import Logout from "@/components/Logout";
import { User } from "@/types/User";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import MobileHomeCategorySelector from "@/features/home/HomeCategorySelector";
import { categories } from "@/types/Categories";

export default async function Page({
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
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const { nickName } = await params; // 이 페이지 유저 닉네임, 추후 API 사용을 위해

  async function getUser() {
    // 유저 데이터 가져오기
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data } = await response.json();
    if (!data) {
      notFound();
    }
    return data as User;
  }

  const [user] = await Promise.all([getUser()]);

  const selectedCategories = categories.filter((i) => user.categories?.includes(i))

  return (
    <div className="min-h-dvh w-full bg-[#F9F9F9] pb-[104px] flex flex-col">
        <MobileHomeCategorySelector defaultSelectedCategories={selectedCategories}/>
    </div>
  );
}
