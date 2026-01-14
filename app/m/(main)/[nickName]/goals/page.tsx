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
  const currentUser = session!.user;

  const { nickName } = await params;
  const decodedNickName = decodeURIComponent(nickName);
  const isOwner = currentUser!.nickName === decodedNickName;

  if (!isOwner) {
    redirect(`/${nickName}`);
  }

  return <MobileGoalPage nickName={decodedNickName} />;
}
