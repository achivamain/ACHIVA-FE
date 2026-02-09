import { auth } from "@/auth";
import type { PostRes } from "@/types/Post";
import HomePost from "@/features/home/Post";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;

  try {
    const postRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${id}`
    ).then((res) => res.json());

    if (postRes?.data) {
      const post = postRes.data;
      // Strip html tags for description if content is html
      const description = post.content ? post.content.substring(0, 160) : "운동 기록을 확인해보세요.";

      return {
        title: `${post.writer.nickname}님의 운동 기록`,
        description: description,
        openGraph: {
          title: `${post.writer.nickname}님의 운동 기록`,
          description: description,
          images: post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls : ['/logo.png'],
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch post metadata", e);
  }

  return {
    title: "운동 기록 상세",
    description: "나는오늘운동한다 게시물 상세 페이지입니다.",
  };
}


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
    <div className="flex-1 flex items-center justify-center">
      <div className="w-xl p-5">
        <HomePost post={data} />
      </div>
    </div>
  );
}
