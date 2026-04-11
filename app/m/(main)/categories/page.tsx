import Logout from "@/components/Logout";
import { getAuthSession } from "@/lib/getAuthSession";
import { getMe } from "@/lib/getUser";
import { redirect } from "next/navigation";

export default async function Page() {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const user = await getMe(token);
  redirect(`/m/${encodeURIComponent(user.nickName)}/home`);
}
