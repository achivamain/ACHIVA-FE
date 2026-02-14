import FeedPost from "@/features/feed/FeedPost";
import { getAuthSession } from "@/lib/getAuthSession";
import Logout from "@/components/Logout";
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
    <div className="flex-1 flex items-center justify-center">
      <div className="w-xl p-5">
        <FeedPost post={data} />
      </div>
    </div>
  );
}
