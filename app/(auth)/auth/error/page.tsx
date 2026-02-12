"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { handleSignIn } from "@/features/onboarding/handleSignIn";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-theme">
      <div className="flex flex-col items-center justify-center gap-4 my-10">
        <h2 className="text-2xl text-white font-bold">오류가 발생했습니다</h2>
        <p className="text-white">
          회원가입/로그인 중 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <form action={handleSignIn}>
          <button>
            <span className="font-bold text-theme hover:underline flex justify-center items-center w-[359px] h-[46px] px-[63px] py-2.5 rounded-[5px] bg-white/90">
              다시 시도하기
            </span>
          </button>
        </form>
        <Link
          href="/"
          className="font-bold text-theme hover:underline flex justify-center items-center w-[359px] h-[46px] px-[63px] py-2.5 rounded-[5px] bg-white/90"
        >
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
