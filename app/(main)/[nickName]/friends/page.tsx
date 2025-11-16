import Friends from "@/features/friends/Friends";
import { Suspense } from "react";
import FriendsSkeleton from "@/features/friends/FriendsSkeleton";
import { auth } from "@/auth";
import Logout from "@/components/Logout";

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
  const currentUser = session!.user;
  return (
    <div className="flex justify-center">
      <div className="w-xl py-10">
        <h2 className="font-bold text-xl pb-5">친구 목록</h2>
        <Suspense fallback={<FriendsSkeleton />}>
          <Friends
            nickName={nickName}
            isMe={currentUser?.nickName === nickName}
          />
        </Suspense>
      </div>
    </div>
  );
}
