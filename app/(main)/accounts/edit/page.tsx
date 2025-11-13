import EditProfile from "@/features/user/EditProfile";
import { auth } from "@/auth";
import Logout from "@/components/Logout";

export default async function Page() {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }

  return (
    <div className="w-full h-dvh flex items-center justify-center">
      <EditProfile />
    </div>
  );
}
