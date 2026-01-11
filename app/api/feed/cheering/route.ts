// 피드 - 응원 탭 proxy api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PostRes } from "@/types/Post";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("pageParam") ?? "0";

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/cheering-feed?page=${pageParam}&size=10&sort=createdAt,DESC`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  const rawContent = data.data?.content ?? data.content ?? [];
  const content = rawContent.filter((post: PostRes) =>
    post.photoUrl?.startsWith("https://") || post.photoUrl == ""
  );

  const responseData = data.data ?? data;
  return NextResponse.json({
    ...responseData,
    content: content,
  });
}
