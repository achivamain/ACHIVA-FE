// 홈 게시글 불러오기 프록시 api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("pageParam");

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/home?page=${pageParam}&size=3&sort=createdAt,DESC`,
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
        `Server Error: GET /api/articles/home?page=${pageParam}: [${res.status}] ${errorBody}`,
      );
      return NextResponse.json(
        { error: "홈 게시물 조회 요청 실패" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const content = data.content;
    return NextResponse.json({
      ...data,
      content: content,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
