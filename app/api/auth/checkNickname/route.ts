import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");

  if (!nickname) {
    return NextResponse.json(
      { error: "닉네임을 입력해주세요." },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/check-nickname?nickname=${nickname}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res;
}

