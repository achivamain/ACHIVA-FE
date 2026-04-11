// 피드 - 내가 가입한 모임 게시글 proxy api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("pageParam") ?? "0";

  const session = await auth();
  const token = session?.access_token;
  const currentUserId = session?.user?.id;

  if (!token || !currentUserId) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/moim/members/${currentUserId}?page=${pageParam}&size=10&sort=createdAt,DESC`,
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
        `Server Error: GET /api/moim/members/${currentUserId}?page=${pageParam}: [${res.status}] ${errorBody}`,
      );
      return NextResponse.json(
        { error: "모임 피드 조회 요청 실패" },
        { status: res.status },
      );
    }

    const data = await res.json();

    const rawContent = data.data?.content ?? data.content ?? [];
    const content = rawContent;

    const responseData = data.data ?? data;
    return NextResponse.json({
      ...responseData,
      content,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
