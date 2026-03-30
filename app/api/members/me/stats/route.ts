// 내 운동 통계 프록시 api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/me/stats`,
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
      `Server Error: GET /api/members/me/stats: [${res.status}] ${errorBody}`,
    );
    return NextResponse.json(
      { error: "통계 조회 실패" },
      { status: res.status },
    );
  }

  return res;
}
