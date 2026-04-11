"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
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
import {
  DayPicker,
  type DayButtonProps,
} from "react-day-picker";
import type { PostsData } from "@/types/responses";

type HomeRecordCalendarProps = {
  userId: string;
};

const WEEK_STARTS_ON = 1 as const;
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const PAGE_SIZE = 30;

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getDayIndex(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}



function RecordDayButton({
  day,
  modifiers,
  completedDates,
  completedPostCountByDate,
  className,
  ...buttonProps
}: DayButtonProps & {
  completedDates: Set<string>;
  completedPostCountByDate: Record<string, number>;
}) {
  const date = day.date;
  const dateKey = getDateKey(date);
  const dayIndex = getDayIndex(date);
  const isSelected = Boolean(modifiers.selected);
  const isWeekend = dayIndex >= 5;
  const hasCompleted = completedDates.has(dateKey);
  const completedCount = completedPostCountByDate[dateKey] ?? 0;
  const isDisabled = Boolean(modifiers.disabled);

  return (
    <button
      {...buttonProps}
      type="button"
      className={cn(
        className,
        "flex h-[58px] w-full flex-col items-center justify-center gap-1 rounded-[14px] px-1 py-2 transition-all duration-200 active:scale-95",
        isSelected
          ? "bg-[#6B625A] shadow-md shadow-black/15"
          : hasCompleted
            ? "bg-[#ECA973] hover:bg-[#E09961] shadow-sm"
            : "bg-[#F5F3F0] hover:bg-[#EEE8E1]",
        modifiers.outside && "opacity-35",
        isDisabled && "cursor-default hover:bg-inherit",
      )}
      title={hasCompleted ? `${completedCount}개의 기록` : undefined}
    >
      <span
        className={cn(
          "text-[15px]",
          "font-extrabold leading-none",
          isSelected || hasCompleted
            ? "text-white"
            : dayIndex === 6
              ? "text-[#EF4444]"
              : dayIndex === 5
                ? "text-[#3B82F6]"
                : "text-[#4A433D]",
          isWeekend && !isSelected && !hasCompleted && "font-extrabold",
          isDisabled && "opacity-35",
        )}
      >
        {format(date, "d")}
      </span>
    </button>
  );
}

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
  const headerLabel = format(currentMonth, "yyyy년 M월", { locale: ko });
  const isViewingCurrentMonth = isSameMonth(currentMonth, todayMonth);

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
      <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
        <div className="flex items-start justify-between pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
              Monthly Grace
            </p>
            <h3 className="mt-0.5 text-[18px] font-bold text-[#4A433D]">
              {headerLabel}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setMonthlyDisplayDate((current) => addMonths(current, -1))
              }
              className="inline-flex h-[28px] items-center justify-center rounded-full bg-white px-3 text-[12px] font-bold leading-none text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB]"
            >
              이전 달
            </button>
            {!isViewingCurrentMonth && (
              <button
                type="button"
                onClick={() => setMonthlyDisplayDate(todayMonth)}
                aria-label="이번 달로 돌아가기"
                title="이번 달로 돌아가기"
                className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB]"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.333 10a6.667 6.667 0 1 0 1.953-4.714"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.333 4.444v3.333h3.334"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              setMonthlyDisplayDate((current) =>
                isSameMonth(current, todayMonth)
                  ? current
                  : addMonths(current, 1),
              )
            }
            disabled={isViewingCurrentMonth}
            className="inline-flex h-[28px] items-center justify-center rounded-full bg-white px-3 text-[12px] font-bold leading-none text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB] disabled:cursor-default disabled:text-[#C7CBD1] disabled:hover:bg-white"
          >
            다음 달
          </button>
        </div>

        <div className="min-w-0 overflow-hidden pb-4">
          <DayPicker
            mode="single"
            locale={ko}
            weekStartsOn={WEEK_STARTS_ON}
            month={currentMonth}
            selected={selectedDate ?? undefined}
            onSelect={handleSelect}
            onMonthChange={setMonthlyDisplayDate}
            hideNavigation
            disabled={{ after: today }}
            styles={{
              root: {
                maxWidth: "100%",
              },
              months: {
                maxWidth: "100%",
              },
              month: {
                maxWidth: "100%",
              },
              month_grid: {
                tableLayout: "fixed",
                width: "100%",
                maxWidth: "100%",
              },
              week: {
                height: `${calendarCellHeight}px`,
              },
              day: {
                height: `${calendarCellHeight}px`,
                padding: 0,
                width: `${100 / 7}%`,
              },
              day_button: {
                width: "100%",
                height: "100%",
              },
            }}
            classNames={{
              root: "w-full max-w-full overflow-hidden",
              months: "w-full max-w-full",
              month: "w-full max-w-full",
              month_caption: "hidden",
              month_grid: "w-full table-fixed border-separate border-spacing-[4px]",
              weekdays:
                "[&_th:nth-child(6)]:text-[#3B82F6] [&_th:nth-child(7)]:text-[#EF4444]",
              weekday: "h-8 text-center text-[11px] font-bold text-[#9CA3AF]",
              day: "p-0 align-middle",
              day_button: "w-full",
              disabled: "pointer-events-none",
            }}
            formatters={{
              formatWeekdayName: (date) => DAY_LABELS[getDayIndex(date)],
            }}
            components={{
              DayButton: (props) => (
                <RecordDayButton
                  {...props}
                  completedDates={completedDates}
                  completedPostCountByDate={completedPostCountByDate}
                />
              ),
            }}
          />
        </div>

        {selectedDate && (
          <div className="mt-4 rounded-[18px] border border-[#F0EBE3] bg-[#FAFAF8] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-[#D96B2B]">
                  {DAY_LABELS[getDayIndex(selectedDate)]}요일
                </p>
                <h4 className="mt-0.5 text-[18px] font-extrabold text-[#4A433D]">
                  {format(selectedDate, "M월 d일", { locale: ko })}
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
          </div>
        )}
      </div>
    </section>
  );
}
