import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import MobileGoalPage from "@/features/user/goals/MobileGoalPage";

export default async function MobileGoalsPage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  const token = session?.access_token;
  if (!token) {
    redirect("/api/auth/logout");
  }

  const { nickName } = await params;
  const decodedNickName = decodeURIComponent(nickName);

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
  const isOwner = me.nickName === decodedNickName;

  if (!isOwner) {
    redirect(`/${nickName}`);
  }

  return <MobileGoalPage nickName={decodedNickName} />;
}
