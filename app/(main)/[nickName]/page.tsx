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
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ nickName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { nickName } = await params;

  // fetch data
  try {
    // Note: This fetch might fail if the API requires authentication and the crawler is not authenticated.
    // However, for public profiles, an unauthenticated endpoint should ideally be available.
    // Assuming the current API endpoint requires a token, this might throw or return unauthorized.
    // We'll implement a fallback.
    const product = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api2/members/${nickName}`
    ).then((res) => res.json());

    if (product?.data) {
      return {
        title: `${product.data.nickname}님의 프로필 | 나는오늘운동한다`,
        description: `${product.data.nickname}님의 운동 기록을 확인해보세요.`,
        openGraph: {
          title: `${product.data.nickname}님의 프로필`,
          description: `${product.data.nickname}님의 운동 기록을 확인해보세요.`,
          images: [product.data.profileImageUrl || '/default.png'],
        },
      };
    }
  } catch (e) {
    console.error("Failed to fetch user metadata", e);
  }

  return {
    title: `${nickName}님의 프로필`,
    description: "나는오늘운동한다 사용자 프로필입니다.",
  };
}


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
