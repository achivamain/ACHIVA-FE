import MobileSidebar from "@/components/MobileSidebar";
import { auth } from "@/auth";
import Logout from "@/components/Logout";
import LoginNotifier from "@/components/LoginNotifier";

export default async function Layout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const session = await auth();
  if (session?.error) {
    return <Logout />;
  }

  return (
    <>
      <LoginNotifier />
      <MobileSidebar />
      <div className="min-h-dvh flex flex-col">{children}</div>
      {modal}
    </>
  );
}
