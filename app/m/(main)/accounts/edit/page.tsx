import MobileHeader from "@/components/MobileHeader";
import EditProfile from "@/features/user/EditProfile";
import { auth } from "@/auth";
import Logout from "@/components/Logout";

export default async function Page() {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }
  return (
    <>
      <MobileHeader>프로필 수정</MobileHeader>
      <div className="w-full flex justify-center pt-10 px-5">
        <EditProfile />
      </div>
    </>
  );
}
