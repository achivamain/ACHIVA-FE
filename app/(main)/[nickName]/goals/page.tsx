import { redirect } from "next/navigation";
import Logout from "@/components/Logout";
import GoalPage from "@/features/user/goals/GoalPage";
import Banner from "@/features/event/Banner";
import { isOwner } from "@/lib/getUser";
import { getAuthSession } from "@/lib/getAuthSession";

export default async function GoalsPage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const { nickName } = await params;

  // 백엔드 API로 실제 유저 닉네임을 조회하여 본인 확인
  if (!await isOwner(nickName, token)) {
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
