import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import GoalPage from "@/features/user/goals/GoalPage";
import Banner from "@/features/event/Banner";

export default async function GoalsPage({
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

  return (
    <div className="w-full flex-1 flex">
      <div className="flex-1 flex flex-col justify-between">
        <GoalPage />
      </div>
      <div className="bg-[#fafafa] w-60 hidden md:flex justify-center">
        <Banner />
      </div>
    </div>
  );
}
