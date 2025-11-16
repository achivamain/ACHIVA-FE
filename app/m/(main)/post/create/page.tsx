// 처음 카테고리별 글 작성횟수 + 유저 정보만 불러오는 서버 컴포넌트
import { auth } from "@/auth";
import MobileCreatePostPage from "@/features/post/create/MobileCreatePostPage";
import getAuthStatus from "@/lib/getAuthStatus";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = (await getAuthStatus()).user;
  if (!user) {
    redirect("/");
  }

  const session = await auth();
  const token = session?.access_token;

  /* const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/{memberId}/count-by-category?memberId=${user.id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const { data } = await response.json();
*/
  return <MobileCreatePostPage />;
}
