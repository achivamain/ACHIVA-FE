// 모달로 겹쳐지는 페이지
import Modal from "@/components/Modal";
import Friends from "@/features/friends/Friends";
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
    <Modal title={<h1 className="text-center">친구</h1>}>
      <div className="mt-8 w-md overflow-y-auto h-130">
        <Friends
          nickName={nickName}
          isMe={me.nickName === decodeURIComponent(nickName)}
        />
      </div>
    </Modal>
  );
}
