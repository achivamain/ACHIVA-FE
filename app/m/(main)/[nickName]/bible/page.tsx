import Logout from "@/components/Logout";
import BibleReadingFlow from "@/features/bible/BibleReadingFlow";
import { getAuthSession } from "@/lib/getAuthSession";
import { getMe } from "@/lib/getUser";
import { notFound, redirect } from "next/navigation";
import {
  buildMobileUserPath,
  isSameNickName,
  normalizeNickName,
} from "@/lib/nickname";

export default async function MobileBiblePage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const { nickName } = await params;
  const user = await getMe(token).catch(() => null);
  if (!user) notFound();

  if (!isSameNickName(user.nickName, nickName)) {
    redirect(buildMobileUserPath(nickName, "/bible"));
  }

  return <BibleReadingFlow nickName={normalizeNickName(nickName)} />;
}
