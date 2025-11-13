import AuthHydrator from "@/features/auth/AuthHydrator";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/auth";
import Logout from "@/components/Logout";

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
  console.log(session);
  return (
    <>
      <AuthHydrator user={auth.user!} />
      <Sidebar user={auth.user!} />
      <div className="flex flex-col sm:ml-20 lg:ml-60 min-h-dvh">
        {children}
        {/* <Footer /> */}
      </div>
      {modal}
    </>
  );
}
