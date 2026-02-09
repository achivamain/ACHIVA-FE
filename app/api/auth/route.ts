import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidateTag } from "next/cache";

// 회원정보 수정 프록시 api
export async function PUT(req: NextRequest) {
  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const user = await req.json(); // Assuming the user data comes from the request body
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
        categories: user.categories,
        description: user.description,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "Backend error", details: errorText },
        { status: res.status }
      );
    }

    revalidateTag("me");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT /api/auth error:", error);
    return NextResponse.json({ error: "Client fetch error" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  const token = session?.access_token;
  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "Backend error", details: errorText },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/auth error:", error);
    return NextResponse.json({ error: "Client fetch error" }, { status: 500 });
  }
}
