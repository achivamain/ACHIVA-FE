import "server-only";

import { UserDetail } from "@/types/User";
import { notFound, redirect } from "next/navigation";

type ApiResponse<T> = {
  data?: T;
};

const handlingResError = (res: Response) => {
  switch (res.status) {
    case 404:
      notFound();
    case 401:
      redirect("/api/auth/logout");
    case 428:
      redirect("/api/auth/logout");
    default:
      throw new Error(`서버 에러: ${res.status}`);
  }
};

export async function getMemberDetail(memberId: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/members/${memberId}/detail`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    handlingResError(res);
  }

  const { data } = (await res.json()) as ApiResponse<UserDetail>;
  if (!data) {
    throw new Error("Invalid response data");
  }

  return data;
}
