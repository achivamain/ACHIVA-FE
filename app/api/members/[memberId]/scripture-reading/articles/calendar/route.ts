import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId } = await params;
  const { searchParams } = new URL(req.url);
  const yearMonth = searchParams.get("yearMonth");

  if (!yearMonth) {
    return NextResponse.json({ error: "yearMonth is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/${encodeURIComponent(memberId)}/scripture-reading/articles/calendar?yearMonth=${encodeURIComponent(yearMonth)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error(
        `Server Error: GET /api/members/${memberId}/scripture-reading/articles/calendar: [${res.status}] ${errorBody}`,
      );
      return NextResponse.json(
        { error: "월별 성경일독 기록 조회 실패" },
        { status: res.status },
      );
    }

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
