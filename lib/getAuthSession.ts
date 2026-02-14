// 서버에서만 실행

import { auth } from "@/auth";
import { redirect } from "next/navigation";

type AuthSessionResult =
  | { error: true; token: null }
  | { error: false; token: string };

// 토큰이 없으면 자동 로그아웃 됨
export async function getAuthSession(): Promise<AuthSessionResult> {
  const session = await auth();
  if (session?.error) {
    return { error: true, token: null };
  }
  const token = session?.access_token;

  if (!token) {
    redirect("/api/auth/logout");
  }

  return { error: false, token: token };
}