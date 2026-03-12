// 모달로 겹쳐지는 페이지
import Modal from "@/components/Modal";
import Friends from "@/features/friends/Friends";
import Logout from "@/components/Logout";
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

  const isMe = await isOwner(nickName, token);

  return (
    <Modal title={<h1 className="text-center">친구</h1>}>
      <div className="mt-8 w-md overflow-y-auto h-130">
        <Friends nickName={nickName} isMe={isMe} />
      </div>
    </Modal>
  );
}
