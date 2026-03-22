import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// GET api/moim - 모임 목록 페이징 조회 (검색/필터)
export async function GET(req: NextRequest) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/moim?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "모임 목록 조회 실패" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in fetching moims:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST api/moim - 새 모임 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/moim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend Create Moim Error:", res.status, errorText);
      return NextResponse.json({ error: "모임 생성 실패", details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in creating moim:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
