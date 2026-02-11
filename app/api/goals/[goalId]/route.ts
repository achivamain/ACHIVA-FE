// 개별 목표 관리 proxy api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// GET api/goals/{goalId} - 특정 목표 조회
export async function GET(
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
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals/${goalId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "특정 목표 조회 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in fetching specific goals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT api/goals/{goalId} - 목표 수정
export async function PUT(
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
    const body = await req.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals/${goalId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "목표 수정 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in updating goals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE api/goals/{goalId} - 목표 삭제
export async function DELETE(
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
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals/${goalId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "목표 삭제 실패" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in deleting goals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
