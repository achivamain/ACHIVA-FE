import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await auth();
  const token = session?.access_token;
  const currentUserId = session?.user?.id;
  const { id, memberId } = await params;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  if (currentUserId && memberId === currentUserId) {
    return NextResponse.json(
      { error: "본인은 내보낼 수 없습니다." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/moim/${id}/members/${memberId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json().catch(() => ({ success: true }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error kicking member:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
