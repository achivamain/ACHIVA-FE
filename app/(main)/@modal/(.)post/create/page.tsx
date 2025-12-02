// 모달로 겹쳐지는 페이지
import CreatePostPage from "@/features/post/create/CreatePostPage";
import { auth } from "@/auth";
import Logout from "@/components/Logout";


export default async function Page() {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }


  return <CreatePostPage/>;
}