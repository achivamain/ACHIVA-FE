'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // 여기에 에러 로깅 서비스(Sentry 등)를 붙일 수 있습니다.
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[50vh] gap-4 p-4">
            <h2 className="text-xl font-bold">페이지를 불러오는 중 문제가 발생했습니다.</h2>
            <p className="text-gray-500 text-sm">{error.message || "알 수 없는 오류가 발생했습니다."}</p>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
                다시 시도
            </button>
        </div>
    )
}
