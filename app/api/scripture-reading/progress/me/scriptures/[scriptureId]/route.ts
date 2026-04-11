import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ scriptureId: string }> },
) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scriptureId } = await params;
  const body = await req.json();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/scripture-reading/progress/me/scriptures/${encodeURIComponent(scriptureId)}`,
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
      const errorBody = await res.json().catch(() => null);
      console.error(
        `Server Error: PUT /api/scripture-reading/progress/me/scriptures/${scriptureId}: [${res.status}] ${errorBody}`,
      );
      return NextResponse.json(
        { error: "성경일독 진도 저장 실패" },
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
