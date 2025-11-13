import MobileHeader from "@/components/MobileHeader";
import Friends from "@/features/friends/Friends";
import { auth } from "@/auth";
import Logout from "@/components/Logout";

export default async function Page({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { nickName } = await params;
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  const currentUser = session!.user;

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader>친구</MobileHeader>
      <div className="flex-1 flex flex-col px-5 pb-5">
        <Friends
          nickName={nickName}
          isMe={currentUser?.nickName === nickName}
        />
      </div>
    </div>
  );
}
