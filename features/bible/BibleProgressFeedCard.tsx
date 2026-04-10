"use client";

import { useEffect, useMemo, useState } from "react";
import { useBibleProgress } from "@/features/bible/progressStore";

function MiniDots({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const dotCount = Math.min(10, total);

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: dotCount }, (_, index) => {
        const threshold = Math.ceil(((index + 1) / dotCount) * total);
        const filled = completed >= threshold;

        return (
          <span
            key={`${total}-${index}`}
            className={
              filled
                ? "h-2.5 w-2.5 rounded-full bg-[#D96B2B]"
                : "h-2.5 w-2.5 rounded-full border border-[#E5DDD4] bg-white"
            }
          />
        );
      })}
    </div>
  );
}

export default function BibleProgressFeedCard() {
  const { activeBooks } = useBibleProgress();
  const [page, setPage] = useState(0);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(activeBooks.length / pageSize));
  const visibleBooks = useMemo(() => {
    const start = page * pageSize;
    return activeBooks.slice(start, start + pageSize);
  }, [activeBooks, page]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

  return (
    <section className="flex w-full flex-col rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[17px] font-bold text-[#4A433D]">
          성경일독 진행 상황
        </h3>
        <span className="rounded-full bg-[#FFF4EC] px-3 py-1 text-[11px] font-semibold text-[#D96B2B]">
          내 피드
        </span>
      </div>

      {activeBooks.length === 0 ? (
        <div className="mt-4 rounded-[18px] border border-dashed border-gray-200 bg-[#FAFAF8] px-4 py-4 text-[13px] leading-6 text-[#8A817A]">
          아직 읽기 기록이 없습니다.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {visibleBooks.map((book) => (
              <div
                key={book.id}
                className="rounded-[18px] border border-gray-100 bg-[#FAFAF8] px-3.5 py-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#4A433D]">
                      {book.name}
                    </h4>
                    <p className="mt-1 text-[12px] font-medium text-[#8A817A]">
                      {book.completed} / {book.totalChapters}장
                    </p>
                  </div>
                  <p className="text-[15px] font-black text-[#D96B2B]">
                    {book.progressPercent}%
                  </p>
                </div>

                <div className="mt-2.5 h-2 rounded-full bg-[#ECE7E1]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#F6C89A_0%,#D96B2B_100%)]"
                    style={{ width: `${book.progressPercent}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <MiniDots completed={book.completed} total={book.totalChapters} />
                  <p className="text-[11px] font-medium text-[#8A817A]">
                    {book.lastReadChapter}장까지
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <div
              className="flex items-center justify-between rounded-[18px] border border-gray-100 bg-[#FAFAF8] px-3 py-2.5"
            >
              <button
                type="button"
                onClick={() => canGoPrev && setPage((current) => current - 1)}
                disabled={!canGoPrev}
                className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D] disabled:opacity-35"
              >
                이전
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPage(index)}
                    aria-label={`${index + 1} 페이지`}
                    className={
                      index === page
                        ? "h-2.5 w-5 rounded-full bg-[#D96B2B]"
                        : "h-2.5 w-2.5 rounded-full bg-[#D9D3CC]"
                    }
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => canGoNext && setPage((current) => current + 1)}
                disabled={!canGoNext}
                className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D] disabled:opacity-35"
              >
                다음
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
