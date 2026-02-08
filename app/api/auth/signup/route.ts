// cognito에서 받는 것 외의 카테고리 등의 회원정보 등록 위함
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      }
    );

    return res;
  } catch (error) {
    console.error("Signup API Proxy error:", error);
    return NextResponse.json(
      { error: "회원가입 요청 중 네트워크 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
