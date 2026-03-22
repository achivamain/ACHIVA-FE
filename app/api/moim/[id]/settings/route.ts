import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// PUT /api/moim/[id]/settings - 모임 설정 업데이트
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const token = session?.access_token;
  const { id: moimId } = await params;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/moim/${moimId}/settings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "설정 변경 실패", details: errorText },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating moim settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
