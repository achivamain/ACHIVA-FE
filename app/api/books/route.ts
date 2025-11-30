import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { DraftPost } from "@/types/Post";
import { Book, BookRes } from "@/types/Book";
import { BookCoverImage, bookCoverImages } from "@/types/BookCoverImages";
import { Category, categories } from "@/types/Categories";

function bookResToBook(bookRes: BookRes): Book {
  const category: Category = categories.find(
    (i) => i == bookRes.mainArticle.category
  )!;

  const coverColor: string = bookRes.mainArticle.backgroundColor;
  const coverImage: BookCoverImage =
    bookCoverImages.find((i) => i == bookRes.mainArticle.photoUrl) || "default";

  return {
    id: bookRes.id,
    title: bookRes.mainArticle.title,
    category: category,
    coverColor: coverColor,
    coverImage: coverImage,
    count: bookRes.articles.length,
  };
}

// 자신의 책 로딩
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
  return Response.json({
    ...data,
    content: data.content.map((item: BookRes) => bookResToBook(item)),
  });
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
