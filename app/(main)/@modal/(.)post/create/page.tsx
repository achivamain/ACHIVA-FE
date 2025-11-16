// 모달로 겹쳐지는 페이지
import { auth } from "@/auth";
import CreatePostPage from "@/features/post/create/CreatePostPage";
import getAuthStatus from "@/lib/getAuthStatus";
import { redirect } from "next/navigation";


export default async function Page() {
  const user = (await getAuthStatus()).user;
  if (!user) {
    redirect("/");
  }

  const session = await auth();
  const token = session?.access_token;


  return <CreatePostPage/>;
}