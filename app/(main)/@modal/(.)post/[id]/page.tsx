import PostModal from "@/features/post/PostModal";
import FeedPost from "@/features/feed/FeedPost";
import { getPostData } from "@/lib/getData";
import Logout from "@/components/Logout";
import { getAuthSession } from "@/lib/getAuthSession";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const data = await getPostData(id, token);

  return (
    <PostModal>
      <div className="w-125 p-5">
        <FeedPost post={data} />
      </div>
    </PostModal>
  );
}
