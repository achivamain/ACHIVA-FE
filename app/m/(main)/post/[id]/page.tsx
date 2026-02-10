import MobileHeader from "@/components/MobileHeader";
import { auth } from "@/auth";
import type { PostRes } from "@/types/Post";
import Post from "@/features/post/Post";
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
    <div className="flex-1 flex flex-col">
      <MobileHeader>게시물</MobileHeader>
      <div className="flex-1 flex pb-22 items-center">
        <Post post={data} />
      </div>
    </div>
  );
}
