// 목표 관련 proxy api

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// GET api/goals - 활성 목표 목록 조회
export async function GET() {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "목표 조회 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in fetching goals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST api/goals - 새 목표 생성
export async function POST(req: NextRequest) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "목표 생성 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in creating goals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
