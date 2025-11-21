// 처음 카테고리별 글 작성횟수 + 유저 정보만 불러오는 서버 컴포넌트
import MobileCreatePostPage from "@/features/post/create/MobileCreatePostPage";
import { auth } from "@/auth";
import Logout from "@/components/Logout";

export default async function Page() {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  return <MobileCreatePostPage />;
}
