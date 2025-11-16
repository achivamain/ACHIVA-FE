import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import useGoalStore from "@/store/GoalStore";
import MobileGoalArchivePage from "@/features/user/goals/MobileGoalArchivePage";

export default async function MobileGoalArchivePageRoute({
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
  const isOwner = currentUser!.nickName === decodeURIComponent(nickName);

  if (!isOwner) {
    redirect(`/${nickName}`);
  }

  const initialData = useGoalStore.getState();

  if (!initialData) {
    notFound();
  }

  const processedInitialData = {
    vision: initialData.vision,
    missions: initialData.missions,
    mindsets: initialData.mindsets,
  };

  return <MobileGoalArchivePage initialData={processedInitialData} />;
}
