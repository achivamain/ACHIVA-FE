import Friends from "@/features/friends/Friends";
import { Suspense } from "react";
import FriendsSkeleton from "@/features/friends/FriendsSkeleton";
import Logout from "@/components/Logout";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/getUser";
import { getAuthSession } from "@/lib/getAuthSession";

export default async function Page({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { nickName } = await params;
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  // 백엔드 API로 실제 유저 닉네임을 조회하여 본인 확인
  const isMe = await isOwner(nickName, token);
  if (!isMe) {
    redirect(`/${nickName}`);
  }

  return (
    <div className="flex justify-center">
      <div className="w-xl py-10">
        <h2 className="font-bold text-xl pb-5">친구 목록</h2>
        <Suspense fallback={<FriendsSkeleton />}>
          <Friends nickName={nickName} isMe={isMe} />
        </Suspense>
      </div>
    </div>
  );
}
