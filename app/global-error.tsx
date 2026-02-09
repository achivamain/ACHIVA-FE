'use client'

import { pretendard } from "@/lib/fonts";
import "./globals.css";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="ko">
            <body className={`${pretendard.className} antialiased min-h-dvh flex flex-col items-center justify-center`}>
                <div className="flex flex-col items-center gap-4 text-center">
                    <h2 className="text-2xl font-bold">시스템에 문제가 발생했습니다. (Global Error)</h2>
                    <p className="text-gray-500">잠시 후 다시 시도해주세요.</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </body>
        </html>
    )
}
