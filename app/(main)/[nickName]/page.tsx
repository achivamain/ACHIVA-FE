import { Profile } from "@/features/user/Profile";
import type { FriendData } from "@/types/Friends";
import Footer from "@/components/Footer";
import Posts from "@/features/user/Posts";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/getUser";
import WeeklyCalendar from "@/features/user/WeeklyCalendar";
import { looksLikeStaticAssetPathSegment } from "@/lib/routeGuards";
import MyAchievementsSummary from "@/features/user/MyAchievementsSummary";
import { getMemberDetail } from "@/lib/server/getMemberDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { nickName } = await params; // 이 페이지 유저 닉네임

  if (looksLikeStaticAssetPathSegment(nickName)) {
    notFound();
  }

  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  const token = session?.access_token;
  const currentUser = session!.user;

  async function getMyFriends() {
    // 로그인한 유저의 친구 목록
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/friendships`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
    const { data } = await response.json();
    if (!data) {
      notFound();
    }
    return data as FriendData[];
  }

  async function getMyPendingFriends() {
    // 로그인한 유저의 수락 대기 친구 목록
    // 하..... 걍 api 하나로 통합하면 안되나
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/friendships/sent-requests`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );
    const { data } = await response.json();
    if (!data) {
      notFound();
    }
    return data as FriendData[];
  }

  const user = await getUser(nickName, token!);

  const [myFriends, myPendingFriends, memberDetail] = await Promise.all([
    getMyFriends(),
    getMyPendingFriends(),
    getMemberDetail(user.id, token!),
  ]);

  const myAllFriends = [...myFriends, ...myPendingFriends];
  return (
    <div className="flex-1 w-full flex flex-col pb-22 sm:pb-0 sm:pt-15 px-5">
      <div className="flex-1 flex flex-col mx-auto w-full max-w-160 gap-9">
        <Profile
          user={user}
          currentUserId={currentUser!.id!}
          currentUserFriends={myAllFriends}
        />
        <WeeklyCalendar userId={user.id} />
        <MyAchievementsSummary
          totalCount={memberDetail.articleCount}
          streakWeeks={memberDetail.continuousGoalWeeks}
          totalCharacterCount={memberDetail.totalCharacterCountFrom2025}
          totalCheeringScore={
            memberDetail.totalSendingCheeringScore +
            memberDetail.totalReceivingCheeringScore
          }
        />
        <div className="flex-1 flex flex-col">
          <Posts userId={user.id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
