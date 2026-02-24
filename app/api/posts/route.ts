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

  // 확인 절차를 추가하긴 했는데 불필요시 삭제 가능
  if ((draft.photoUrls?.length ?? 0) > 5) {
    return NextResponse.json(
      { error: "이미지는 최대 5장까지 업로드 가능합니다." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/articles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photoUrls: draft.photoUrls,
          title: draft.title || "오늘의 운동",
          category: draft.category,
          question: draft.pages!.map(({ subtitle, content }) => ({
            question: subtitle ?? "",
            content,
          })),
          backgroundColor: draft.backgroundColor,
        }),
      },
    );
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error(
        `Server Error: POST /api/articles: [${res.status}] ${errorBody}`,
      );
      return NextResponse.json(
        { error: "게시글 업로드 요청 실패" },
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
    },
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
    },
  );

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    console.error(
      `Server Error: DELETE /api/articles: [${res.status}] ${errorBody}`,
    );
    return NextResponse.json(
      { error: "게시글 삭제 요청 실패" },
      { status: res.status },
    );
  }

  return res;
}
