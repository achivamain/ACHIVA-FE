// cognito hosted ui로 로그인/회원가입 후 연결되는 페이지
// 로그인을 한 건지 회원가입을 한 건지 판단해서 올바른 페이지로 리다이렉트
"use client";

import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    async function CheckIsInit() {
      try {
        const res = await fetch(`/api/auth/isinit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          window.location.replace("/api/auth/logout");
          return;
        }

        // false - 신규 유저(회원가입) / true - 기존 유저(로그인)
        const isInit = (await res.json()).data;

        if (isInit) {
          const meRes = await fetch(`/api/members/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!meRes.ok) {
            window.location.replace("/api/auth/logout");
            return;
          }

          const user = (await meRes.json()).data as { nickName?: string };
          const nickName = user?.nickName;

          if (!nickName) {
            window.location.replace("/api/auth/logout");
            return;
          }

          router.replace(`/${encodeURIComponent(nickName)}/home`);
          return;
        }

        router.replace("/signup");
      } catch {
        window.location.replace("/api/auth/logout");
      }
    }

    CheckIsInit();
  }, [router]);

  return <Loading />;
}
