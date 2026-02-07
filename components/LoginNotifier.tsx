"use client";

// 로그인 성공 시 RN 환경으로 LinkToken 전달을 위한 컴포넌트 

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const LOGIN_NOTIFIED_KEY = "login_push_notified";


export default function LoginNotifier() {
  const { data: session, status } = useSession();
  const sentRef = useRef(false);

  useEffect(() => {
    // 로딩 중이면 대기
    if (status !== "authenticated" || !session) return;

    // RN 아니면 무시
    if (typeof window === "undefined") return;
    if (!(window as any).ReactNativeWebView) return;

    // 중복 방지 
    if (sentRef.current) return;

    // 이 세션에서 보낸 적 있으면 무시
    if (sessionStorage.getItem(LOGIN_NOTIFIED_KEY)) return;

    sentRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/push/link-intent", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("link-intent failed");

        const { linkToken } = await res.json();

        if (linkToken) {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "LOGIN_SUCCESS",
              linkToken,
            })
          );

          // 성공 시 SessionStorage에 기록 
          sessionStorage.setItem(LOGIN_NOTIFIED_KEY, "true");
        }
      } catch (e) {
        console.error("linkToken 전달 실패", e);
      }
    })();
  }, [status, session]);

  return null;
}

