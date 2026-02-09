import MobileHeader from "@/components/MobileHeader";
import Friends from "@/features/friends/Friends";
import Logout from "@/components/Logout";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/getAuthSession";
import { isOwner } from "@/lib/getUser";

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
    <div className="flex-1 flex flex-col">
      <MobileHeader>친구</MobileHeader>
      <div className="flex-1 flex flex-col px-5 pb-5">
        <Friends nickName={nickName} isMe={isMe} />
      </div>
    </div>
  );
}
