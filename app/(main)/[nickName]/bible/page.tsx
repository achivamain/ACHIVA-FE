import Logout from "@/components/Logout";
import BibleReadingFlow from "@/features/bible/BibleReadingFlow";
import { getAuthSession } from "@/lib/getAuthSession";
import { getMe, isOwner } from "@/lib/getUser";
import { notFound, redirect } from "next/navigation";

export default async function BiblePage({
  params,
}: {
  params: Promise<{ nickName: string }>;
}) {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const { nickName } = await params;
  const user = await getMe(token).catch(() => null);
  if (!user) notFound();

  if (!(await isOwner(nickName, token))) {
    redirect(`/${nickName}`);
  }

  return <BibleReadingFlow nickName={decodeURIComponent(nickName)} />;
}
