import { redirect } from "next/navigation";
import Logout from "@/components/Logout";
import MobileGoalPage from "@/features/user/goals/MobileGoalPage";
import { getAuthSession } from "@/lib/getAuthSession";
import { isOwner } from "@/lib/getUser";
import { buildUserPath, normalizeNickName } from "@/lib/nickname";

export default async function MobileGoalsPage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const { nickName } = await params;

  // 백엔드 API로 실제 유저 닉네임을 조회하여 본인 확인
  if (!(await isOwner(nickName, token))) {
    redirect(buildUserPath(nickName));
  }

  return <MobileGoalPage nickName={normalizeNickName(nickName)} />;
}
