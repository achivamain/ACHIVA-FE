import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// 모임 탈퇴 (DELETE /api/moim/[id]/members/me)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const token = session?.access_token;
  const { id } = await params;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/moim/${id}/members/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error leaving moim:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
