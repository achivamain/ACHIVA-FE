// 목표 보관 여부 토글하는 proxy api

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// PATCH /api/goals/{goalId}/archive - 목표 클릭 카운트 추가
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const { goalId } = await params;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals/${goalId}/archive`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "목표 보관 여부 수정 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in archiving/dearchiving goal:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}