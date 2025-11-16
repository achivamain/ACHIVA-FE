import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import useGoalStore from "@/store/GoalStore";
import MobileGoalEditPage from "@/features/user/goals/MobileGoalEditPage";

export default async function MobileGoalEditPageRoute({
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
  const isOwner = currentUser!.nickName === nickName;

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

  return <MobileGoalEditPage initialData={processedInitialData} />;
}
