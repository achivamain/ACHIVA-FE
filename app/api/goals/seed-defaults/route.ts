// 초기 목표 고정값 생성 proxy api

// POST api/goals/seed-defaults - 보관된 목표 목록 조회
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals/seed-defaults`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "초기 목표 생성 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in generating initial goals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
