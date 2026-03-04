import MobileHeader from "@/components/MobileHeader";
import Friends from "@/features/friends/Friends";
import Logout from "@/components/Logout";
import { getAuthSession } from "@/lib/getAuthSession";
import { isOwner } from "@/lib/getUser";

export default async function Page({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { nickName } = await params;
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const isMe = await isOwner(nickName, token);

  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader>친구</MobileHeader>
      <div className="flex-1 flex flex-col px-5 pb-5">
        <Friends nickName={nickName} isMe={isMe} />
      </div>
    </div>
  );
}
