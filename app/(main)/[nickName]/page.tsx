import { Profile } from "@/features/user/Profile";
import type { FriendData } from "@/types/Friends";
import Footer from "@/components/Footer";
import Posts from "@/features/user/Posts";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import { notFound } from "next/navigation";
import { getUser, isOwner } from "@/lib/getUser";
import { WebProfileSummary } from "@/features/home/ProfileSummary";
import { getSummeryData } from "@/lib/getData";
import WeeklyCalendar from "@/features/user/WeeklyCalendar";
import { looksLikeStaticAssetPathSegment } from "@/lib/routeGuards";

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

  const [user, isMyProfile] = await Promise.all([
    getUser(nickName, token!),
    isOwner(nickName, token!),
  ]);

  const [myFriends, myPendingFriends, summaryResult] = await Promise.all([
    getMyFriends(),
    getMyPendingFriends(),
    isMyProfile ? getSummeryData(token!) : null, // 불필요한 api 호출 방지
  ]);

  const myAllFriends = [...myFriends, ...myPendingFriends];
  const mySummaryData = summaryResult?.mySummaryData ?? {
    letters: 0,
    count: 0,
    points: 0,
  };
  return (
    <div className="flex-1 w-full flex flex-col pb-22 sm:pb-0 sm:pt-15 px-5">
      <div className="flex-1 flex flex-col mx-auto w-full max-w-160 gap-9">
        <Profile
          user={user}
          currentUserId={currentUser!.id!}
          currentUserFriends={myAllFriends}
        />
        <WeeklyCalendar userId={user.id} />
        {isMyProfile && (
          <div className="flex flex-col w-full max-w-[844px] bg-white rounded-[20px] py-5 px-4 sm:py-6 sm:px-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-[16px] sm:text-[18px] text-gray-900 tracking-tight flex items-center gap-1.5">
                  올해의 은혜 기록 <span className="text-xl">🕊️</span>
                </h3>
              </div>
              <div className="bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                <span className="text-[12px] text-orange-600 font-medium">
                  꾸준한 기록의 발자취!
                </span>
              </div>
            </div>
            <WebProfileSummary summaryData={mySummaryData} />
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <Posts userId={user.id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
