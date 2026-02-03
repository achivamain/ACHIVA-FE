import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// LinkToken 발급받는 proxy api

export async function POST(req: NextRequest) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/push/link-intent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "linkToken 발급 실패" },
      { status: res.status }
    );
  }

  return res;
}

