// 유저 정보 hydration(기존 내역) + RN으로 token 보내기
"use client";
import { useEffect } from "react";
import { useCurrentUserInfoStore } from "@/store/userStore";
import type { User } from "@/types/User";
import { useSession } from "next-auth/react";

export default function AuthHydrator({ user }: { user: User }) {
  const setUser = useCurrentUserInfoStore.use.setUser();
  const { data: session } = useSession();

  useEffect(() => {
    setUser(user);

    if (typeof window !== "undefined" && window.ReactNativeWebView) {
      try {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "LOGIN_SUCCESS",
            userId: session!.user!.id,
            authToken: session!.access_token, // 필요시 user 객체 구조에 맞게 변경
          })
        );
      } catch (err) {
        console.error("RN postMessage 실패:", err);
      }
    }
  }, [user, setUser, session]);
  return null;
}
