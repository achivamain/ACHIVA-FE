import MobileModal from "@/components/MobileModal";
import CheersTitle from "@/features/user/CheersTitle";
import type { CheerPoint } from "@/types/responses";
import Cheers from "@/features/user/Cheers";
import { getUser } from "@/lib/getUser";
import Logout from "@/components/Logout";
import { getAuthSession } from "@/lib/getAuthSession";

export default async function Page({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { nickName } = await params;
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const user = await getUser(nickName, token);
  const userId = user.id;
  const cheersRes = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/${userId}/cheerings/sending-category-stats`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const cheersData: CheerPoint[] = (await cheersRes.json()).data;
  return (
    <MobileModal title={<CheersTitle nickname={nickName} />}>
      <div className="mt-15 mb-7">
        <Cheers type="보낸" cheers={cheersData} />
      </div>
    </MobileModal>
  );
}
