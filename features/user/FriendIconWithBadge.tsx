"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FollowerIcon } from "@/components/Icons";
import { buildUserPath } from "@/lib/nickname";

type Props = {
  nickName: string;
  isMe: boolean;
};

type FriendsRequestsResponse = {
  friends: { id: number }[];
  users: unknown[];
};

export default function FriendIconWithBadge({ nickName, isMe }: Props) {
  const { data } = useQuery({
    queryKey: ["receivedFriendRequests", nickName],
    queryFn: async (): Promise<FriendsRequestsResponse> => {
      const res = await fetch(`/api/friendships/requests`, { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch friend requests");
      return res.json();
    },
    enabled: isMe,
  });

  const hasPendingRequests =
    isMe && data !== undefined && data.friends.length > 0;

  return (
    <Link href={buildUserPath(nickName, "/friends")} className="relative inline-flex">
      <FollowerIcon />
      {hasPendingRequests && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#FF0000] rounded-full" />
      )}
    </Link>
  );
}
