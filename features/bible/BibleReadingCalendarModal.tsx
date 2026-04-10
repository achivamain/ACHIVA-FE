"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  eachDayOfInterval,
} from "date-fns";
import { ko } from "date-fns/locale";
import type { BibleReadingFeedPost } from "@/features/bible/feedStore";

type BibleReadingCalendarModalProps = {
  authorName: string;
  posts: BibleReadingFeedPost[];
  onClose: () => void;
};

function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function getPostSignature(post: BibleReadingFeedPost) {
  return [
    post.bookName,
    post.rangeStart,
    post.rangeEnd,
    post.completed,
    post.total,
    post.reflection.trim(),
  ].join("|");
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function BibleReadingCalendarModal({
  authorName,
  posts,
  onClose,
}: BibleReadingCalendarModalProps) {
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [posts],
  );
  const initialDate = useMemo(
    () => (sortedPosts[0] ? parseISO(sortedPosts[0].createdAt) : new Date()),
    [sortedPosts],
  );
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(initialDate));
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const postsByDate = useMemo(() => {
    return sortedPosts.reduce<Record<string, BibleReadingFeedPost[]>>((acc, post) => {
      const key = getDateKey(parseISO(post.createdAt));
      const nextPosts = acc[key] ?? [];
      const signature = getPostSignature(post);

      if (nextPosts.some((current) => getPostSignature(current) === signature)) {
        return acc;
      }

      acc[key] = [...nextPosts, post];
      return acc;
    }, {});
  }, [sortedPosts]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(endOfMonth(displayMonth), { weekStartsOn: 1 });

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  }, [displayMonth]);

  const markedDateKeys = useMemo(
    () => new Set(Object.keys(postsByDate)),
    [postsByDate],
  );
  const selectedDateKey = getDateKey(selectedDate);
  const selectedPosts = postsByDate[selectedDateKey] ?? [];

  useEffect(() => {
    if (isSameMonth(selectedDate, displayMonth)) return;

    const monthKeyPrefix = format(displayMonth, "yyyy-MM");
    const firstMarkedInMonth = sortedPosts.find((post) =>
      post.createdAt.startsWith(monthKeyPrefix),
    );

    setSelectedDate(
      firstMarkedInMonth ? parseISO(firstMarkedInMonth.createdAt) : startOfMonth(displayMonth),
    );
  }, [displayMonth, selectedDate, sortedPosts]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-[#8A817A]">
                {authorName}님의 성경일독
              </p>
              <h3 className="mt-1 text-[20px] font-black text-[#4A433D]">
                월별 기록 보기
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D]"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="rounded-[22px] border border-gray-100 bg-[#FAFAF8] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDisplayMonth((current) => subMonths(current, 1))}
                className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D]"
              >
                이전 달
              </button>
              <p className="text-[16px] font-bold text-[#4A433D]">
                {format(displayMonth, "yyyy년 M월", { locale: ko })}
              </p>
              <button
                type="button"
                onClick={() => setDisplayMonth((current) => addMonths(current, 1))}
                className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D]"
              >
                다음 달
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["월", "화", "수", "목", "금", "토", "일"].map((label) => (
                <div
                  key={label}
                  className="pb-1 text-center text-[11px] font-semibold text-[#8A817A]"
                >
                  {label}
                </div>
              ))}
              {monthDays.map((date) => {
                const dateKey = getDateKey(date);
                const hasRecord = markedDateKeys.has(dateKey);
                const isSelected = isSameDay(date, selectedDate);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex h-[56px] flex-col items-center justify-center rounded-[16px] border text-center transition-all",
                      isSelected
                        ? "border-[#F3D5C0] bg-[#FFF4EC]"
                        : hasRecord
                          ? "border-[#F3E3D6] bg-white"
                          : "border-gray-100 bg-white",
                      !isSameMonth(date, displayMonth) && "opacity-35",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[13px] font-bold",
                        isToday(date) ? "text-[#D96B2B]" : "text-[#4A433D]",
                      )}
                    >
                      {format(date, "d")}
                    </span>
                    <span className="mt-1 flex min-h-[14px] items-center justify-center">
                      {hasRecord ? (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFF4EC] px-1.5 text-[10px] font-bold text-[#D96B2B]">
                          {postsByDate[dateKey]?.length ?? 0}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-gray-100 bg-white p-4 shadow-sm">
            <h4 className="text-[18px] font-bold text-[#4A433D]">
              {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
            </h4>

            {selectedPosts.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {selectedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-[18px] border border-gray-100 bg-[#FAFAF8] px-4 py-3"
                  >
                    <p className="text-[14px] font-bold text-[#4A433D]">
                      {post.bookName} {post.rangeLabel}
                    </p>
                    <p className="mt-1 text-[12px] text-[#8A817A]">
                      누적 {post.completed} / {post.total}장
                    </p>
                    {post.reflection ? (
                      <p className="mt-2 text-[13px] leading-6 text-[#6E655D]">
                        {post.reflection}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[18px] border border-dashed border-gray-200 bg-[#FAFAF8] px-4 py-4 text-[13px] leading-6 text-[#8A817A]">
                이 날짜에는 공유된 성경일독 기록이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
