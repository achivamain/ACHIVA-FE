import MobileHeader from "@/components/MobileHeader";
import EditProfile from "@/features/user/EditProfile";
import Logout from "@/components/Logout";
import { getAuthSession } from "@/lib/getAuthSession";

export default async function Page() {
  const { error } = await getAuthSession();
  if (error) return <Logout />;

  return (
    <>
      <MobileHeader>프로필 수정</MobileHeader>
      <div className="w-full flex justify-center pt-10 px-5">
        <EditProfile />
      </div>
    </>
  );
}
