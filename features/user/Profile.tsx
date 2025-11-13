import Link from "next/link";
import type { User } from "@/types/User";
import ProfileImg from "@/components/ProfileImg";
import { SettingIcon, FollowerIcon } from "@/components/Icons";
import FriendShipBtn from "../friends/FriendshipBtn";
import { FriendData } from "@/types/Friends";

type Props = {
  user: User;
  currentUserId: string;
  currentUserFriends: FriendData[];
};

// PC전용
export function Profile({ user, currentUserId, currentUserFriends }: Props) {
  return (
    <div className="w-full flex gap-12">
      <ProfileImg url={user.profileImageUrl!} size={160} />
      <div className="flex-1 flex flex-col items-start justify-center gap-3">
        <div className="w-full flex items-center gap-10">
          <h1 className="font-semibold text-2xl">{user.nickName}</h1>
          {user.id === currentUserId ? (
            <Link
              href="/accounts/edit"
              className="bg-theme rounded-sm text-white font-semibold text-sm px-2.5 py-1.5"
              scroll={false}
            >
              프로필 수정
            </Link>
          ) : (
            <FriendShipBtn
              userId={user.id}
              currentUserFriends={currentUserFriends}
            />
          )}
          <div className="ml-auto flex gap-4 items-center">
            <Link href={`/${user.nickName}/friends`}>
              <FollowerIcon />
            </Link>
            {user.id === currentUserId && (
              <Link href={`/settings/accounts/password`}>
                <SettingIcon />
              </Link>
            )}
          </div>
        </div>
        <p className="text-[#7F7F7F]">{user.description}</p>
        <div className="flex flex-col gap-1.5">
          <p className="font-bold text-lg">성취 카테고리</p>
          <div className="flex gap-2">
            {user.categories.map((category) => (
              <div
                key={category}
                className="rounded-sm w-auto font-semibold text-theme text-sm px-2.5 py-0.5 bg-theme/15"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 모바일 전용
export default function MobileProfile({
  user,
  currentUserId,
  currentUserFriends,
}: Props) {
  return (
    <div className="sm:hidden">
      <div className="h-14 flex items-center justify-end gap-3">
        <Link href={`/${user.nickName}/friends`}>
          <FollowerIcon />
        </Link>
        {user.id === currentUserId && (
          <Link href={`/settings`}>
            <SettingIcon />
          </Link>
        )}
      </div>
      <div className="flex gap-5 mb-7">
        <div className="shrink-0">
          <ProfileImg url={user.profileImageUrl!} size={125} />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-semibold text-2xl">{user.nickName}</h1>
          <p className="text-[#7F7F7F]">{user.description}</p>
          {user.id === currentUserId ? (
            <Link
              href="/accounts/edit"
              className="self-start bg-theme rounded-sm text-white font-semibold text-sm px-2.5 py-1.5 mt-2"
            >
              프로필 수정
            </Link>
          ) : (
            <FriendShipBtn
              userId={user.id}
              currentUserFriends={currentUserFriends}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-bold text-lg">성취 카테고리</p>
        <div className="flex gap-2">
          {user.categories.map((category) => (
            <div
              key={category}
              className="rounded-sm w-auto font-semibold text-theme text-sm px-2.5 py-0.5 bg-theme/15"
            >
              {category}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
