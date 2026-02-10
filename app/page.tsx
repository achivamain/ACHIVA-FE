// 루트 경로 페이지 - 미들웨어 오류 대비 

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Onboarding from "@/features/onboarding/Onboarding";

export default async function RootPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/feed");
  }

  return <Onboarding />;
}

