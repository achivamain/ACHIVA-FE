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
  const token = session?.access_token;
  if (!token) {
    redirect("/api/auth/logout");
  }

  const { nickName } = await params;

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
  const isOwner = me.nickName === decodeURIComponent(nickName);

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
