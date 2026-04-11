// 서버에서만 실행

import { User } from "@/types/User";
import { notFound, redirect } from "next/navigation";

const handlingResError = (res: Response) => {
  switch (res.status) {
    case 404:
      notFound();
    case 401:
      redirect("/api/auth/logout"); //인증 오류시 로그아웃 처리
    case 428:
      redirect("/api/auth/logout"); //인증 오류시 로그아웃 처리
    default:
      throw new Error(`서버 에러: ${res.status}`);
  }
};

type ApiResponse<T> = {
  data?: T;
};

async function fetchAuthorizedData<T>(path: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    handlingResError(res);
  }

  const { data } = (await res.json()) as ApiResponse<T>;
  if (!data) {
    throw new Error("Invalid response data");
  }

  return data;
}

// 유저 데이터 가져오기
export async function getUser(nickName: string, token: string) {
  return fetchAuthorizedData<User>(`/api2/members/${nickName}`, token);
}

// 자신의 데이터 가져오기
export async function getMe(token: string) {
  return fetchAuthorizedData<User>("/api/members/me", token);
}

// 백엔드 API로 실제 유저 닉네임을 조회하여 본인 확인
export async function isOwner(nickName: string, token: string) {
  const me = await getMe(token);
  const isOwner = me.nickName === decodeURIComponent(nickName);

  return isOwner;
}
