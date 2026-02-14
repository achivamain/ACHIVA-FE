import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidateTag } from "next/cache";
import type { User } from "@/types/User";
import type { FriendData } from "@/types/Friends";

// 친구 목록 가져오기
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nickName = searchParams.get("nickName");

  const session = await auth();
  const token = session?.access_token;

  async function getFriends() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api2/friendships/${nickName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return (await res.json()).data as FriendData[]; // 친구신청 목록 배열
  }

  async function getUser() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api2/members/${nickName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return (await res.json()).data as User; // 해당 페이지의 유저 id를 얻기 위해....
  }

  const [friends, user] = await Promise.all([getFriends(), getUser()]);

  // 각 친구에 대한 유저 데이터(닉네임, 프로필 등)
  const users = await Promise.all(
    friends.map(async (friend) => {
      const id =
        user.id === friend.receiverId ? friend.requesterId : friend.receiverId;
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const userJson = await userRes.json();

      return userJson.data;
    }),
  );

  const response = {
    friends,
    user,
    users,
  };

  return Response.json(response);
}

// 친구신청
export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/friendships`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recieverId: userId,
        }),
      },
    );
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error(
        `Server Error: POST /api/friendships: [${res.status}] ${errorBody}`,
      );
      return NextResponse.json(
        { error: "친구 신청 요청 실패" },
        { status: res.status },
      );
    }
    revalidateTag("friends");

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
