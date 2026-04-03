import { auth } from "@/auth";
import { getMe } from "@/lib/getUser";
import RankingPage from "@/features/ranking/RankingPage";

export const metadata = {
  title: "랭킹 | ACHIVA",
  description: "ACHIVA 전체 랭킹 및 종목별 랭킹을 확인하세요.",
};

export default async function RankingRoute() {
  const session = await auth();
  const currentUserId = session?.user?.id
    ? Number(session.user.id)
    : undefined;

  let user = null;
  if (session?.access_token) {
    try {
      user = await getMe(session.access_token);
    } catch (error) {
      console.error("Failed to fetch user in ranking page:", error);
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <RankingPage currentUserId={currentUserId} user={user} />
    </div>
  );
}
