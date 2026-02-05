import { auth } from "@/auth";
import Logout from "@/components/Logout";
import { User } from "@/types/User";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { MobileHomeCategorySelector } from "@/features/home/HomeCategorySelector";
import { categories, Category } from "@/types/Categories";

export default async function Page() {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

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

  //필요한 정보만 보내도록 했습니다
  type UserData = Pick<
    typeof user,
    | "nickName"
    | "profileImageUrl"
    | "birth"
    | "gender"
    | "region"
    | "description"
  > & {
    categories: Category[];
  };

  const userData: UserData = {
    ...user,
    categories: categories.filter((i) => user.categories?.includes(i)),
  };

  return (
    <div className="min-h-dvh w-full flex flex-col">
      <MobileHomeCategorySelector user={userData} />
    </div>
  );
}
