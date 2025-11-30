// 게시글 불러오기 프록시 api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("pageParam");
  const userId = searchParams.get("id");
  const sort = searchParams.get("sort");

  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/member/${userId}/articles?page=${pageParam}&size=9&sort=createdAt,${sort}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(res)
  return res;
}
