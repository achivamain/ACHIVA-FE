"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-5">오류가 발생했습니다</h2>
      <p>일시적인 오류가 발생했습니다.</p>
      <Link href="/" className="text-theme hover:underline">
        메인으로 돌아가기
      </Link>
      <button
        onClick={() => reset()}
        className="text-white hover:underline bg-theme"
      >
        새로고침
      </button>
    </div>
  );
}
