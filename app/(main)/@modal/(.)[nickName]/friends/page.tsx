// 모달로 겹쳐지는 페이지
import Modal from "@/components/Modal";
import Friends from "@/features/friends/Friends";
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
    <Modal title={<h1 className="text-center">친구</h1>}>
      <div className="mt-8 w-md overflow-y-auto h-130">
        <Friends nickName={nickName} isMe={isMe} />
      </div>
    </Modal>
  );
}
