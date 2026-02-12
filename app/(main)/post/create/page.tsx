import CreatePostPage from "@/features/post/create/CreatePostPage";
import Logout from "@/components/Logout";
import { getAuthSession } from "@/lib/getAuthSession";

export default async function Page() {
  const { error } = await getAuthSession();
  if (error) return <Logout />;

  return <CreatePostPage />;
}
