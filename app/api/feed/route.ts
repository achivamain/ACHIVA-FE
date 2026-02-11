// 피드 - 전체 탭 proxy api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("pageParam") ?? "0";

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/feed?page=${pageParam}&size=10&sort=createdAt,DESC`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await res.json();

  // 기존 api랑 새로 개발된 api 반환 방식이 달라요.. 일단 둘 다 처리하도록
  const rawContent = data.data?.content ?? data.content ?? [];
  const content = rawContent;

  const responseData = data.data ?? data;
  return NextResponse.json({
    ...responseData,
    content: content,
  });
}
