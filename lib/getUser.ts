// 서버에서만 실행

import { User } from "@/types/User";
import { notFound, redirect } from "next/navigation";

const handlingResError = (res: Response) => {
  switch (res.status) {
    case 404:
      notFound();
    case 428:
      redirect("/api/auth/logout"); //인증 오류시 로그아웃 처리
    default:
      throw new Error(`서버 에러: ${res.status}`);
  }
};

// 유저 데이터 가져오기
export async function getUser(nickName: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api2/members/${nickName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    handlingResError(res);
  }
  const { data } = await res.json();
  if (!data) {
    throw new Error("Invalid user data");
  }
  return data as User;
}

// 자신의 데이터 가져오기
export async function getMe(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/me`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    handlingResError(res);
  }
  const { data } = await res.json();
  if (!data) {
    throw new Error("Invalid user data");
  }
  return data as User;
}

// 백엔드 API로 실제 유저 닉네임을 조회하여 본인 확인
export async function isOwner(nickName: string, token: string) {
  const me = await getMe(token);
  const isOwner = me.nickName === decodeURIComponent(nickName);

  return isOwner;
}
