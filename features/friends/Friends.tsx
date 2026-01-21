"use client";

import ProfileImg from "@/components/ProfileImg";
import Link from "next/link";
import { FriendData } from "@/types/Friends";
import { User } from "@/types/User";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import FriendsSkeleton from "./FriendsSkeleton";
import { useState } from "react";
import { defaultProfileImg } from "@/features/user/defaultProfileImg";
import { useSession } from "next-auth/react";
import { sendFriendAcceptNotification } from "@/lib/pushNotification";

type Props = {
  nickName: string;
  isMe: boolean; // 내 친구 목록을 보고 있는가?
};

type FriendsResponse = {
  friends: FriendData[];
  user: User;
  users: User[];
};

type FriendsRequestsResponse = {
  friends: FriendData[];
  users: User[];
};

export default function Friends({ nickName, isMe }: Props) {
  const { data: session } = useSession();
  const [selectedMenu, setSelectedMenu] = useState<"친구 목록" | "친구 요청">(
    "친구 목록"
  );
  let content; // 친구 혹은 친구 요청 목록

  const queryClient = useQueryClient();

  // 친구 수락 시 뮤테이션 함수
  const acceptFriendMutation = useMutation({
    mutationFn: async ({
      friendshipId,
      requesterId,
      requesterNickName,
    }: {
      friendshipId: number;
      requesterId: string;
      requesterNickName?: string;
    }) => {
      const res = await fetch(
        `/api/friendships/accept?friendshipId=${friendshipId}`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) {
        throw new Error("친구 수락 과정에서 문제가 발생했습니다.");
      }
      return { result: await res.json(), requesterId, requesterNickName, friendshipId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["friends", nickName] });
      queryClient.invalidateQueries({
        queryKey: ["receivedFriendRequests", nickName],
      });

      // 앱에 친구 수락 알림 전송 (postMessage)
      if (session?.access_token && session?.user?.id) {
        sendFriendAcceptNotification(session.access_token, {
          friendshipId: data.friendshipId,
          requesterId: data.requesterId,
          requesterNickName: data.requesterNickName,
          accepterId: session.user.id,
          accepterNickName: session.user.nickName,
        });
      }
    },
  });

  // 친구 거절 시 뮤테이션 함수
  const rejectFriendMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const res = await fetch(
        `/api/friendships/reject?friendshipId=${friendshipId}`,
        {
          method: "PATCH",
        }
      );
      if (!res.ok) {
        throw new Error("친구 거절 과정에서 문제가 발생했습니다.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", nickName] });
      queryClient.invalidateQueries({
        queryKey: ["receivedFriendRequests", nickName],
      });
    },
  });

  // 불러올 친구+신청받은 목록
  const results = useQueries({
    queries: [
      {
        queryKey: ["friends", nickName],
        queryFn: async (): Promise<FriendsResponse> => {
          const res = await fetch(`/api/friendships/?nickName=${nickName}`, {
            method: "GET",
          });

          if (!res.ok) {
            throw new Error("Failed to fetch friends with cache");
          }
          const data = await res.json();
          return data;
        },
      },
      {
        queryKey: ["receivedFriendRequests", nickName],
        queryFn: async (): Promise<FriendsRequestsResponse> => {
          const res = await fetch(`/api/friendships/requests`, {
            method: "GET",
          });

          if (!res.ok) {
            throw new Error("Failed to fetch friends with cache");
          }
          const data = await res.json();
          return data;
        },
        enabled: isMe,
      },
    ],
  });

  const [friends, receivedFriendRequests] = results;

  const isPending = friends.isPending || receivedFriendRequests.isPending;

  if (isPending) {
    content = <FriendsSkeleton />;
  }

  if (friends.data && selectedMenu === "친구 목록") {
    content = (
      <>
        {friends.data.friends.length === 0 && (
          <div className="flex-1 w-full h-full flex items-center justify-center">
            <p className="text-xl text-[#7F7F7F]">아직 친구가 없습니다.</p>
          </div>
        )}
        <ul className="flex flex-col gap-5">
          {friends.data.users.map((user, i) => {
            // 상대방 아이디 - 나중에 더 나은 api가 나오면 바꿀 예정.....

            return (
              <li key={i} className="flex items-center gap-5">
                <Link href={`/${user.nickName}`}>
                  <ProfileImg
                    url={user.profileImageUrl ?? defaultProfileImg}
                    size={60}
                  />
                </Link>
                <Link href={`/${user.nickName}`}>
                  <p className="font-medium text-lg">{user.nickName}</p>
                </Link>
                <div className="ml-auto cursor-pointer">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 16C18 16.3956 17.8827 16.7822 17.6629 17.1111C17.4432 17.44 17.1308 17.6964 16.7654 17.8478C16.3999 17.9991 15.9978 18.0387 15.6098 17.9616C15.2219 17.8844 14.8655 17.6939 14.5858 17.4142C14.3061 17.1345 14.1156 16.7781 14.0384 16.3902C13.9613 16.0022 14.0009 15.6001 14.1522 15.2346C14.3036 14.8692 14.56 14.5568 14.8889 14.3371C15.2178 14.1173 15.6044 14 16 14C16.5304 14 17.0391 14.2107 17.4142 14.5858C17.7893 14.9609 18 15.4696 18 16ZM7.5 14C7.10444 14 6.71776 14.1173 6.38886 14.3371C6.05996 14.5568 5.80362 14.8692 5.65224 15.2346C5.50087 15.6001 5.46126 16.0022 5.53843 16.3902C5.6156 16.7781 5.80608 17.1345 6.08579 17.4142C6.36549 17.6939 6.72186 17.8844 7.10982 17.9616C7.49778 18.0387 7.89992 17.9991 8.26537 17.8478C8.63082 17.6964 8.94318 17.44 9.16294 17.1111C9.3827 16.7822 9.5 16.3956 9.5 16C9.5 15.4696 9.28929 14.9609 8.91421 14.5858C8.53914 14.2107 8.03043 14 7.5 14ZM24.5 14C24.1044 14 23.7178 14.1173 23.3889 14.3371C23.06 14.5568 22.8036 14.8692 22.6522 15.2346C22.5009 15.6001 22.4613 16.0022 22.5384 16.3902C22.6156 16.7781 22.8061 17.1345 23.0858 17.4142C23.3655 17.6939 23.7219 17.8844 24.1098 17.9616C24.4978 18.0387 24.8999 17.9991 25.2654 17.8478C25.6308 17.6964 25.9432 17.44 26.1629 17.1111C26.3827 16.7822 26.5 16.3956 26.5 16C26.5 15.4696 26.2893 14.9609 25.9142 14.5858C25.5391 14.2107 25.0304 14 24.5 14Z"
                      fill="#808080"
                    />
                  </svg>
                </div>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  if (receivedFriendRequests.data && selectedMenu === "친구 요청") {
    content = (
      <>
        {receivedFriendRequests.data.friends.length === 0 && (
          <div className="flex-1 w-full h-full flex items-center justify-center">
            <p className="text-xl text-[#7F7F7F]">
              새로운 친구 요청이 없습니다.
            </p>
          </div>
        )}
        <ul className="flex flex-col gap-5">
          {receivedFriendRequests.data.friends.map((friend, i) => {
            // 상대방 아이디
            const user = receivedFriendRequests.data.users[i];

            return (
              <li key={i} className="flex items-center gap-5">
                <Link href={`/${user.nickName}`}>
                  <ProfileImg
                    url={user.profileImageUrl ?? defaultProfileImg}
                    size={60}
                  />
                </Link>
                <Link href={`/${user.nickName}`}>
                  <p className="font-medium text-lg">{user.nickName}</p>
                </Link>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() =>
                      acceptFriendMutation.mutate({
                        friendshipId: friend.id,
                        requesterId: friend.requesterId,
                        requesterNickName: user.nickName,
                      })
                    }
                    className="font-semibold text-lg px-6 py-2 rounded-md bg-theme text-white"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => rejectFriendMutation.mutate(friend.id)}
                    className="font-semibold text-lg px-6 py-2 rounded-md bg-[#F2F2F2] text-[#4D4D4D]"
                  >
                    거절
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 친구 목록 & 친구 요청 버튼 - 내 페이지에서만 보임 */}
      {isMe && (
        <div className="flex gap-2 mb-5 sm:mb-8">
          <button
            onClick={() => setSelectedMenu("친구 목록")}
            className={`rounded-full font-semibold text-lg px-4 py-2 ${
              selectedMenu === "친구 목록"
                ? "bg-theme text-white"
                : "bg-white text-theme border border-theme"
            }`}
          >
            친구 목록
          </button>
          <button
            onClick={() => setSelectedMenu("친구 요청")}
            className={`relative rounded-full font-semibold text-lg px-4 py-2  ${
              selectedMenu === "친구 요청"
                ? "bg-theme text-white"
                : "bg-white text-theme border border-theme"
            }`}
          >
            친구 요청
            {receivedFriendRequests.data !== undefined &&
              receivedFriendRequests.data.friends.length > 0 && (
                <div className="absolute top-2 right-3 w-1 h-1 bg-[#FF0000] rounded-full" />
              )}
          </button>
        </div>
      )}
      {/* 친구 혹은 친구 요청 목록 */}
      {content}
    </div>
  );
}
