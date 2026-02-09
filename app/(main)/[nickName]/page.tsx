import { Profile } from "@/features/user/Profile";
import type { User } from "@/types/User";
import type { FriendData } from "@/types/Friends";
import Footer from "@/components/Footer";
import PointSection from "@/features/user/Point";
import Posts from "@/features/user/Posts";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  const token = session?.access_token;
  const currentUser = session!.user;

  const { nickName } = await params; // 이 페이지 유저 닉네임

  async function getUser() {
    // 유저 데이터 가져오기
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api2/members/${nickName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data } = await response.json();
    if (!data) {
      notFound();
    }
    return data as User;
  }

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
      }
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
      }
    );
    const { data } = await response.json();
    if (!data) {
      notFound();
    }
    return data as FriendData[];
  }

  const [user, myFriends, myPendingFriends] = await Promise.all([
    getUser(),
    getMyFriends(),
    getMyPendingFriends(),
  ]);
  const myAllFriends = [...myFriends, ...myPendingFriends];
  return (
    <div className="flex-1 w-full flex flex-col pb-22 sm:pb-0 sm:pt-15 px-5">
      <div className="flex-1 flex flex-col mx-auto w-full max-w-160">
        <Profile
          user={user}
          currentUserId={currentUser!.id!}
          currentUserFriends={myAllFriends}
        />
        <div className="flex gap-5 my-5 sm:my-10">
          <Link
            href={`/${nickName}/cheers/received`}
            className="flex-1"
            scroll={false}
          >
            <PointSection label="받은 응원 기록" />
          </Link>
          <Link
            href={`/${nickName}/cheers/sent`}
            className="flex-1"
            scroll={false}
          >
            <PointSection label="보낸 응원 기록" />
          </Link>
        </div>
        <div className="flex-1 flex flex-col">
          <Posts userId={user.id} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
