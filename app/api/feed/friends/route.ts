// 피드 - 친구 탭 proxy api
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PostRes } from "@/types/Post";
import type { FriendData } from "@/types/Friends";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = parseInt(searchParams.get("pageParam") ?? "0");
  const pageSize = 10;

  const session = await auth();
  const token = session?.access_token;
  const currentUserId = session?.user?.id;

  if (!token || !currentUserId) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  // 친구 목록 조회하기
  try {
    const friendsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/friendships`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!friendsRes.ok) {
      const errorBody = await friendsRes.json().catch(() => null);
      console.error(`Server Error: GET /api/friendships: [${friendsRes.status}] ${errorBody}`);
      return NextResponse.json(
        { error: "친구 목록 조회 요청 실패" },
        { status: friendsRes.status },
      );
    }

    const friendsData = await friendsRes.json();
    const friends: FriendData[] = friendsData.data ?? [];
    const acceptedFriends = friends.filter((f) => f.status === "ACCEPTED");

    if (acceptedFriends.length === 0) {
      return NextResponse.json({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: pageParam,
        size: pageSize,
        first: true,
        last: true,
        empty: true,
      });
    }

    // 각 친구의 게시글 전부 조회
    const friendIds = acceptedFriends.map((f) =>
      f.requesterId === currentUserId ? f.receiverId : f.requesterId,
    );

    const postsPromises = friendIds.map(async (friendId) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/member/${friendId}/articles?page=0&size=50&sort=createdAt,DESC`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        console.error(`Server Error: GET /api/member/${friendId}/articles: [${res.status}] ${errorBody}`);
        // 하나 실패해도 나머지는 정상적으로 나오도록 빈 배열 반환
        return [];
      }
      const data = await res.json();
      return (data.data?.content ?? data.content ?? []) as PostRes[];
    });

    const allPostsArrays = await Promise.all(postsPromises);
    const allPosts = allPostsArrays.flat();

    // 정렬
    allPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // 페이지네이션
    const startIdx = pageParam * pageSize;
    const endIdx = startIdx + pageSize;
    const pagedPosts = allPosts.slice(startIdx, endIdx);

    const totalElements = allPosts.length;
    const totalPages = Math.ceil(totalElements / pageSize);

    return NextResponse.json({
      content: pagedPosts,
      totalElements,
      totalPages,
      number: pageParam,
      size: pageSize,
      first: pageParam === 0,
      last: endIdx >= totalElements,
      empty: pagedPosts.length === 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
