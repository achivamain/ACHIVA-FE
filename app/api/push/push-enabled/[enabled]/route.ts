import { auth } from "@/auth";
import { NextResponse } from "next/server";

// PUT /api/push/push-enabled/[enabled] - 푸시 알림 on/off 토글
export async function PUT(
  _req: Request,
  { params }: { params: Promise<{ enabled: string }> },
) {
  const session = await auth();
  if (!session?.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { enabled } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/push/members/me/push-enabled/${enabled}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
