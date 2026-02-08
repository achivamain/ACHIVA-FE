import Friends from "@/features/friends/Friends";
import { Suspense } from "react";
import FriendsSkeleton from "@/features/friends/FriendsSkeleton";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { nickName } = await params;
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  const token = session?.access_token;
  if (!token) {
    redirect("/api/auth/logout");
  }

  // 백엔드 API로 실제 유저 닉네임을 조회하여 본인 확인
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/me`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    redirect("/api/auth/logout");
  }
  const { data: me } = await res.json();

  return (
    <div className="flex justify-center">
      <div className="w-xl py-10">
        <h2 className="font-bold text-xl pb-5">친구 목록</h2>
        <Suspense fallback={<FriendsSkeleton />}>
          <Friends
            nickName={nickName}
            isMe={me.nickName === decodeURIComponent(nickName)}
          />
        </Suspense>
      </div>
    </div>
  );
}
