import { auth } from "@/auth";
import { bookResToBook } from "@/lib/bookResToBook";
import { BookRes } from "@/types/Book";
import { NextRequest, NextResponse } from "next/server";

// 자신의 책 목록 로딩

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("pageParam");
  const sizeParam = searchParams.get("sizeParam");

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/books/my?page=${pageParam}&size=${sizeParam}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  return NextResponse.json({
    ...data,
    content: data.content.map((item: BookRes) => {
      const bookItem = bookResToBook(item);
      return { ...bookItem, articles: undefined };
    }),
  });
}
