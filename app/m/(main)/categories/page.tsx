import Logout from "@/components/Logout";
import { getAuthSession } from "@/lib/getAuthSession";
import { getMe } from "@/lib/getUser";
import { redirect } from "next/navigation";
import { buildMobileUserPath } from "@/lib/nickname";

export default async function Page() {
  const { error, token } = await getAuthSession();
  if (error) return <Logout />;

  const user = await getMe(token);
  redirect(buildMobileUserPath(user.nickName, "/home"));
}
