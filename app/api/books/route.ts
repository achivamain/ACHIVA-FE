import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { DraftPost } from "@/types/Post";
import { bookResToBook } from "@/lib/bookResToBook";

//책 상세 조회
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");

  const session = await auth();
  const token = session?.access_token;
  try {
    if (!token) {
      return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/books/${bookId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "내부 서버 오류 발생" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(bookResToBook(data));

  } catch (error) {
    console.error("fetch error:", error);
    return NextResponse.json(
      { error: "요청 처리 중 오류 발생" },
      { status: 500 }
    );
  }
}

//책 생성

export async function POST(req: NextRequest) {
  const { data } = await req.json();
  const draft = data as DraftPost;
  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: draft.book?.title,
      description: "",
      main: {
        photoUrl: draft.book?.coverImage,
        title: draft.book?.title,
        category: draft.category,
        question: [
          {
            question: "",
            content: "",
          },
        ],
        backgroundColor: draft.book?.coverColor,
      },
      articleIds: [],
    }),
  });
  return res;
}
