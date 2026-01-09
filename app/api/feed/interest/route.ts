// feed - 관심 탭 proxy api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PostRes } from "@/types/Post";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const pageParam = searchParams.get("pageParam") ?? "0";

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  if (!memberId) {
    return NextResponse.json({ error: "memberId 필요" }, { status: 400 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/${memberId}/feed?page=${pageParam}&size=10&sort=createdAt,DESC`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  const content = (data.data?.content ?? data.content ?? []).filter(
    (post: PostRes) => post.photoUrl?.startsWith("https://")
  );

  return NextResponse.json({
    ...data,
    data: data.data ? { ...data.data, content } : undefined,
    content: data.data ? undefined : content,
  });
}

