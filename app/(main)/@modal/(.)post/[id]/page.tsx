import PostModal from "@/features/post/PostModal";
import { auth } from "@/auth";
import type { PostRes } from "@/types/Post";
import FeedPost from "@/features/feed/FeedPost";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const token = session?.access_token;

  async function getPost() {
    const postRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const postData = await postRes.json();

    if (postData.code === 2000) {
      notFound();
    }
    return postData;
  }

  async function getCheering() {
    const cheeringRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${id}/cheerings`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return cheeringRes.json();
  }

  const [postData, cheeringData] = await Promise.all([
    getPost(),
    getCheering(),
  ]);

  const data: PostRes = {
    ...postData.data,
    cheerings: cheeringData.data.content,
  };

  return (
    <PostModal>
      <div className="w-125 p-5">
        <FeedPost post={data} />
      </div>
    </PostModal>
  );
}
