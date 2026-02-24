// 게시글 불러오기 프록시 api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("pageParam") ?? "0";
  const userId = searchParams.get("id");
  const sort = searchParams.get("sort") ?? "DESC";
  const size = searchParams.get("size") ?? "9";

  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/member/${userId}/articles?page=${pageParam}&size=${size}&sort=createdAt,${sort}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  const content = data.data.content;
  return NextResponse.json({
    ...data,
    data: { ...data.data, content: content },
  });
}
