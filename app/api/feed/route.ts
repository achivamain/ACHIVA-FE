// 피드 - 카테고리별 게시글 proxy api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const pageParam = searchParams.get("pageParam") ?? "0";

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  if (!category) {
    return NextResponse.json({ error: "category 필요" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/categories/${encodeURIComponent(category)}?page=${pageParam}&size=10&sort=createdAt,DESC`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error(
        `Server Error: GET /api/articles/categories/${category}?page=${pageParam}: [${res.status}] ${errorBody}`,
      );
      return NextResponse.json(
        { error: "피드 조회 요청 실패" },
        { status: res.status },
      );
    }

    const data = await res.json();

    // 기존 api랑 새로 개발된 api 반환 방식이 달라요.. 일단 둘 다 처리하도록
    const rawContent = data.data?.content ?? data.content ?? [];
    const content = rawContent;

    const responseData = data.data ?? data;
    return NextResponse.json({
      ...responseData,
      content: content,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
