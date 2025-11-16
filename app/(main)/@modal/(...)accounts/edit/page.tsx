// 모달로 겹쳐지는 페이지
import Modal from "@/components/Modal";
import EditProfile from "@/features/user/EditProfile";
import { auth } from "@/auth";
import Logout from "@/components/Logout";

export default async function Page() {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }

  return (
    <Modal title={<h1 className="text-center">프로필 수정</h1>}>
      <div className="my-7 sm:w-2xl lg:w-3xl flex justify-center">
        <EditProfile />
      </div>
    </Modal>
  );
}
