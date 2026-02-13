// 친구신청 수락 프록시 api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const friendshipId = searchParams.get("friendshipId");

  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const res = await fetch(
      // 왜 path로 안 받고 쿼리로 받는거임??
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/friendships/{friendshipId}/accept?friendshipId=${friendshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error(`Server Error: /api/friendships/{friendshipId}/accept?friendshipId=${friendshipId}: [${res.status}] ${errorBody}`);
      return NextResponse.json(
        { error: "친구 신청 수락 요청 실패" },
        { status: res.status },
      );
    }

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
