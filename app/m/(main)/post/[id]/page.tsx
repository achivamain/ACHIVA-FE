import MobileHeader from "@/components/MobileHeader";
import FeedPost from "@/features/feed/FeedPost";
import Logout from "@/components/Logout";
import { getAuthSession } from "@/lib/getAuthSession";
import { getPostData } from "@/lib/getData";

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
    <div className="flex-1 flex flex-col">
      <MobileHeader>게시물</MobileHeader>
      <div className="flex-1 flex pb-22 items-center">
        <FeedPost post={data} />
      </div>
    </div>
  );
}
