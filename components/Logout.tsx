"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

// 레이아웃에서 로그아웃 하는 게 안 되는 것 같아서 클라이언트 컴포넌트 팜
// 더 좋은 방법 있으면 바꿔 주세요..
export default function Logout() {
  const { data: session } = useSession();
  useEffect(() => {
    console.log(session?.error, "!");
    if (session?.error) {
      signOut();
    }
  });
  return null;
}
