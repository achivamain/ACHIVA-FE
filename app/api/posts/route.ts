// 게시글 작성 프록시 api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { DraftPost } from "@/types/Post";

export async function POST(req: NextRequest) {
  const { post } = await req.json();
  const draft = post as DraftPost;
  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        photoUrl: draft.titleImageUrl,
        title: draft.title || "오늘의 성취",
        category: draft.category,
        question: draft.pages!.map(({ subtitle, content }) => ({
          question: subtitle ?? "",
          content,
        })),
        backgroundColor: draft.backgroundColor,
      }),
    }
  );

  return res;
}

// 단일 게시물 불러오기 프록시 api
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${postId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res;
}

// 게시물 삭제 프록시 api
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles/${postId}/delete?articleId=${postId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res;
}
