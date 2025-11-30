// cognito hosted ui로 로그인/회원가입 후 연결되는 페이지
// 로그인을 한 건지 회원가입을 한 건지 판단해서 올바른 페이지로 리다이렉트
"use client";

import Loading from "@/components/Loading";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    async function CheckIsInit() {
      const res = await fetch(`/api/auth/isinit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // false - 신규 유저(회원가입) / true - 기존 유저(로그인)
      const isInit = (await res.json()).data;

      if (isInit) {
        redirect("/");
      } else {
        redirect("/signup");
      }
    }
    CheckIsInit();
  }, []);

  return <Loading />;
}
