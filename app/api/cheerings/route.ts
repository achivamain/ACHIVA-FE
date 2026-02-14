// 응원 관련 프록시 api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${postId}/cheerings`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res;
}

export async function POST(req: NextRequest) {
  const { postId, cheeringType } = await req.json();

  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${postId}/cheerings?articleId=${postId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: cheeringType,
          cheeringCategory: cheeringType,
        }),
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error(`Server Error: [${res.status}] ${errorBody}`);
      return NextResponse.json(
        { error: "응원하기 요청 실패" },
        { status: res.status },
      );
    }

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const cheeringId = searchParams.get("cheeringId");

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${postId}/cheerings/${cheeringId}?cheeringId=${cheeringId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error(`Server Error: [${res.status}] ${errorBody}`);
      return NextResponse.json(
        { error: "응원 취소 요청 실패" },
        { status: res.status },
      );
    }

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
