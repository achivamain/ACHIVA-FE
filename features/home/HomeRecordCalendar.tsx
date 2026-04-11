"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import { usePathname, useRouter } from "next/navigation";
import RecordCalendarBase from "@/components/calendar/RecordCalendarBase";
import {
  DAY_LABELS,
  getDateKey,
  getDayIndex,
} from "@/components/calendar/calendarUtils";
import type { PostsData } from "@/types/responses";

type HomeRecordCalendarProps = {
  userId: string;
};

const PAGE_SIZE = 30;

export default function HomeRecordCalendar({
  userId,
}: HomeRecordCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const today = useMemo(() => new Date(), []);
  const todayMonth = useMemo(() => startOfMonth(today), [today]);
  const [monthlyDisplayDate, setMonthlyDisplayDate] = useState(todayMonth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [completedPostCountByDate, setCompletedPostCountByDate] = useState<
    Record<string, number>
  >({});
  const [completedCategoriesByDate, setCompletedCategoriesByDate] = useState<
    Record<string, string[]>
  >({});

  const currentMonth = useMemo(
    () => startOfMonth(monthlyDisplayDate),
    [monthlyDisplayDate],
  );
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const monthEndExclusive = useMemo(() => addDays(monthEnd, 1), [monthEnd]);
  const calendarCellHeight = 58;
  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedCompletedCategories = selectedDateKey
    ? (completedCategoriesByDate[selectedDateKey] ?? [])
    : [];
  const selectedCompletedCount = selectedDateKey
    ? (completedPostCountByDate[selectedDateKey] ?? 0)
    : 0;

  useEffect(() => {
    if (!selectedDate) return;
    if (!isSameMonth(selectedDate, currentMonth)) {
      setSelectedDate(null);
    }
  }, [currentMonth, selectedDate]);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function fetchCompletedStatus() {
      try {
        const nextCompletedDates = new Set<string>();
        const nextCompletedPostCountByDate = new Map<string, number>();
        const nextCompletedCategoriesByDate = new Map<string, Set<string>>();
        const fetchFloor = currentMonth;
        let page = 0;

        while (true) {
          const response = await fetch(
            `/api/members/getPosts?pageParam=${page}&size=${PAGE_SIZE}&id=${userId}&sort=DESC`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch record calendar posts");
          }

          const json = await response.json();
          const data = json.data as PostsData;

          if (!data?.content?.length) break;

          let reachedBeforeFloor = false;

          for (const post of data.content) {
            const postDate = parseISO(post.createdAt);

            if (isBefore(postDate, fetchFloor)) {
              reachedBeforeFloor = true;
              break;
            }

            if (
              isBefore(postDate, monthEndExclusive) &&
              !isBefore(postDate, fetchFloor)
            ) {
              const dateKey = getDateKey(postDate);
              nextCompletedDates.add(dateKey);
              nextCompletedPostCountByDate.set(
                dateKey,
                (nextCompletedPostCountByDate.get(dateKey) ?? 0) + 1,
              );

              const categoriesForDate =
                nextCompletedCategoriesByDate.get(dateKey) ?? new Set<string>();
              categoriesForDate.add(post.category);
              nextCompletedCategoriesByDate.set(dateKey, categoriesForDate);
            }
          }

          if (reachedBeforeFloor || data.last) break;
          page += 1;
        }

        setCompletedDates(nextCompletedDates);
        setCompletedPostCountByDate(
          Object.fromEntries(nextCompletedPostCountByDate.entries()),
        );
        setCompletedCategoriesByDate(
          Object.fromEntries(
            Array.from(nextCompletedCategoriesByDate.entries()).map(
              ([date, values]) => [date, Array.from(values)],
            ),
          ),
        );
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Failed to fetch record calendar data", error);
      }
    }

    fetchCompletedStatus();

    return () => controller.abort();
  }, [currentMonth, monthEndExclusive, userId]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(null);
      return;
    }
    if (selectedDate && isSameDay(selectedDate, date)) {
      setSelectedDate(null);
      return;
    }
    setMonthlyDisplayDate(startOfMonth(date));
    setSelectedDate(date);
  };

  const moveToArchive = () => {
    if (!selectedDate) return;

    const dateText = getDateKey(selectedDate);
    const recordArchive = document.getElementById("record-archive");

    if (recordArchive) {
      recordArchive.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(
        {},
        "",
        `${window.location.pathname}?date=${dateText}#record-archive`,
      );
      return;
    }

    router.push(`${pathname}?date=${dateText}#record-archive`);
  };

  return (
    <section className="mx-5 sm:mx-auto sm:w-full sm:max-w-[640px]">
      <RecordCalendarBase
        month={currentMonth}
        onMonthChange={setMonthlyDisplayDate}
        selectedDate={selectedDate}
        onSelectDate={handleSelect}
        markedDates={completedDates}
        markedCountByDate={completedPostCountByDate}
        currentMonth={todayMonth}
        disableAfter={today}
        limitToCurrentMonth
        calendarCellHeight={calendarCellHeight}
        topContent={
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
                Monthly Grace
              </p>
              <h3 className="mt-0.5 text-[18px] font-bold text-[#4A433D]">
                {format(currentMonth, "yyyy년 M월", { locale: ko })}
              </h3>
            </div>
          </div>
        }
        renderSelectedPanel={(date) => (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-[#D96B2B]">
                  {DAY_LABELS[getDayIndex(date)]}요일
                </p>
                <h4 className="mt-0.5 text-[18px] font-extrabold text-[#4A433D]">
                  {format(date, "M월 d일", { locale: ko })}
                </h4>
              </div>
              <button
                type="button"
                onClick={moveToArchive}
                className="rounded-full bg-[#4A433D] px-3 py-1.5 text-[12px] font-bold text-white"
              >
                기록 보기
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <p className="mb-2 text-[12px] font-semibold text-[#9CA3AF]">
                  기록한 은혜
                </p>
                {selectedCompletedCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCompletedCategories.map((category) => (
                      <span
                        key={category}
                        className="rounded-full bg-[#FFF4EC] px-3 py-1.5 text-[13px] font-semibold text-[#D96B2B] ring-1 ring-[#D96B2B]/20"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#C8C0B4]">
                    이 날짜에는 기록이 없습니다
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-[12px] font-medium text-[#6B7280]">
                <span>작성한 기록 수</span>
                <span className="rounded-full bg-white px-2.5 py-1 font-bold text-[#1A1A1A] ring-1 ring-[#E5E7EB]">
                  {selectedCompletedCount}개
                </span>
              </div>
            </div>
          </>
        )}
      />
    </section>
  );
}
