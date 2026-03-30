import { auth } from "@/auth";
import { NextResponse } from "next/server";

// GET /api/push/settings - 푸시 알림 설정 조회
export async function GET() {
  const session = await auth();
  if (!session?.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/push/settings`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
