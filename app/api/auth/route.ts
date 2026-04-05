import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidateTag } from "next/cache";

// 회원정보 수정 프록시 api
export async function PUT(req: NextRequest) {
  const { user } = await req.json();
  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: user.email,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl,
      birth: user.birth,
      gender: user.gender,
      region: user.region || "",
      description: user.description,
    }),
  });

  revalidateTag("me");
  return res;
}

export async function DELETE() {
  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
}
