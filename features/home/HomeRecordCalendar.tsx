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
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";
import { usePathname, useRouter } from "next/navigation";
import {
  DayPicker,
  type DayButtonProps,
  type WeekProps,
} from "react-day-picker";
import type { PostsData } from "@/types/responses";

type HomeRecordCalendarProps = {
  userId: string;
};

type ViewMode = "weekly" | "monthly";

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

function GraceFlameIcon({
  active,
  selected,
}: {
  active: boolean;
  selected: boolean;
}) {
  const flameFill = selected ? "#FFFFFF" : active ? "#D96B2B" : "#D8C0AA";
  const innerGlowFill = selected
    ? "rgba(255,255,255,0.45)"
    : active
      ? "#F4C675"
      : "#EBDDD0";

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10.039 1.784C10.376 3.449 9.796 5.071 8.52 6.528C7.684 7.482 6.861 8.28 6.509 9.451C6.06 10.948 6.462 12.47 7.448 13.579C8.084 14.292 8.923 14.753 9.992 14.968C9.497 14.362 9.221 13.673 9.197 12.898C9.153 11.53 9.893 10.356 10.969 9.216C11.858 8.274 12.858 7.316 13.453 6.159C13.996 6.883 14.49 7.599 14.921 8.391C15.555 9.556 15.957 10.765 15.957 12.082C15.957 15.258 13.386 17.778 10.197 17.778C6.848 17.778 4.479 15.23 4.479 12.127C4.479 10.312 5.252 8.767 6.496 7.425C7.836 5.979 9.45 4.551 10.039 1.784Z"
        fill={flameFill}
      />
      <path
        d="M10.628 5.322C10.742 6.447 10.308 7.385 9.487 8.337C8.94 8.97 8.384 9.608 8.181 10.391C7.883 11.528 8.149 12.53 8.921 13.4C9.301 13.827 9.805 14.168 10.489 14.366C10.303 13.891 10.233 13.385 10.287 12.811C10.387 11.768 11.003 10.931 11.707 10.103C12.286 9.423 12.894 8.744 13.244 7.964C13.758 8.913 14.075 9.833 14.075 10.834C14.075 13.164 12.22 14.934 9.985 14.934C7.743 14.934 6.11 13.191 6.11 11.014C6.11 9.594 6.749 8.405 7.723 7.328C8.73 6.217 9.943 5.289 10.628 5.322Z"
        fill={innerGlowFill}
      />
    </svg>
  );
}

function RecordDayButton({
  day,
  modifiers,
  variant,
  completedDates,
  completedPostCountByDate,
  className,
  ...buttonProps
}: DayButtonProps & {
  variant: ViewMode;
  completedDates: Set<string>;
  completedPostCountByDate: Record<string, number>;
}) {
  const date = day.date;
  const dateKey = getDateKey(date);
  const dayIndex = getDayIndex(date);
  const isSelected = Boolean(modifiers.selected);
  const isPast = startOfDay(date) < startOfDay(new Date()) && !isToday(date);
  const isWeekend = dayIndex >= 5;
  const hasCompleted = completedDates.has(dateKey);
  const completedCount = completedPostCountByDate[dateKey] ?? 0;
  const shouldDimPast = isPast && !isSelected;
  const isDisabled = Boolean(modifiers.disabled);

  const content = (
    <>
      <span
        className={cn(
          variant === "weekly" ? "text-[18px]" : "text-[13px]",
          "font-extrabold leading-none",
          isSelected
            ? "text-white"
            : isToday(date)
              ? "text-[#5B6470]"
              : dayIndex === 6
                ? "text-[#EF4444]"
                : dayIndex === 5
                  ? "text-[#3B82F6]"
                  : "text-[#4A433D]",
          isWeekend && variant === "monthly" && !isSelected && "font-extrabold",
          shouldDimPast && "opacity-55",
          isDisabled && "opacity-35",
        )}
      >
        {format(date, "d")}
      </span>
      <div className="mt-1 flex min-h-[16px] items-center justify-center">
        {hasCompleted ? (
          <span
            className={cn(
              "inline-flex h-[18px] items-center justify-center rounded-full px-1.5",
              isSelected ? "bg-white/18" : "bg-[#FFF4EC]",
            )}
            aria-label={`${completedCount}개의 기록`}
            title={`${completedCount}개의 기록`}
          >
            <GraceFlameIcon active={completedCount > 0} selected={isSelected} />
          </span>
        ) : null}
      </div>
    </>
  );

  if (variant === "weekly") {
    return (
      <button
        {...buttonProps}
        type="button"
        className={cn(
          className,
          "flex h-[76px] w-full flex-col items-center justify-center gap-1.5 rounded-[18px] px-1 py-3 transition-all duration-200 active:scale-95",
          isSelected
            ? "bg-[#6B625A] shadow-lg shadow-black/15"
            : hasCompleted
              ? "bg-[#FFF8D9] hover:bg-[#FFF3BF]"
              : isToday(date)
                ? "bg-[#F7F7F5] ring-2 ring-inset ring-[#C2C8D0] hover:bg-[#FAFAF8]"
                : "bg-[#F5F3F0] hover:bg-[#EEE8E1]",
          isDisabled && "cursor-default hover:bg-inherit",
        )}
      >
        {content}
      </button>
    );
  }

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
            ? "bg-[#FFF8D9] hover:bg-[#FFF3BF]"
            : isToday(date)
              ? "bg-[#F7F7F5] ring-2 ring-inset ring-[#C2C8D0] hover:bg-[#FAFAF8]"
              : "bg-[#F5F3F0] hover:bg-[#EEE8E1]",
        modifiers.outside && "opacity-35",
        isDisabled && "cursor-default hover:bg-inherit",
      )}
    >
      {content}
    </button>
  );
}

function WeeklyRow({
  visibleWeekStart,
  week,
  className,
  ...props
}: WeekProps & {
  visibleWeekStart: Date;
}) {
  const isVisibleWeek = week.days.some((calendarDay) =>
    isSameDay(
      startOfWeek(calendarDay.date, { weekStartsOn: WEEK_STARTS_ON }),
      visibleWeekStart,
    ),
  );

  return <tr {...props} className={cn(className, !isVisibleWeek && "hidden")} />;
}

export default function HomeRecordCalendar({
  userId,
}: HomeRecordCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const today = useMemo(() => new Date(), []);
  const todayMonth = useMemo(() => startOfMonth(today), [today]);
  const currentWeekStart = useMemo(
    () => startOfWeek(today, { weekStartsOn: WEEK_STARTS_ON }),
    [today],
  );
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [monthlyDisplayDate, setMonthlyDisplayDate] = useState(todayMonth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [completedPostCountByDate, setCompletedPostCountByDate] = useState<
    Record<string, number>
  >({});
  const [completedCategoriesByDate, setCompletedCategoriesByDate] = useState<
    Record<string, string[]>
  >({});

  const weekStart = currentWeekStart;
  const currentMonth = useMemo(
    () => startOfMonth(monthlyDisplayDate),
    [monthlyDisplayDate],
  );
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const monthEndExclusive = useMemo(() => addDays(monthEnd, 1), [monthEnd]);
  const weekEndExclusive = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const calendarCellHeight = viewMode === "weekly" ? 76 : 58;
  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedCompletedCategories = selectedDateKey
    ? (completedCategoriesByDate[selectedDateKey] ?? [])
    : [];
  const selectedCompletedCount = selectedDateKey
    ? (completedPostCountByDate[selectedDateKey] ?? 0)
    : 0;

  const headerLabel =
    viewMode === "monthly"
      ? format(currentMonth, "yyyy년 M월", { locale: ko })
      : "이번 주 은혜 기록";

  useEffect(() => {
    if (!selectedDate) return;
    if (viewMode === "monthly" && !isSameMonth(selectedDate, currentMonth)) {
      setSelectedDate(null);
    }
  }, [currentMonth, selectedDate, viewMode]);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function fetchCompletedStatus() {
      try {
        const nextCompletedDates = new Set<string>();
        const nextCompletedPostCountByDate = new Map<string, number>();
        const nextCompletedCategoriesByDate = new Map<string, Set<string>>();
        const fetchFloor = isBefore(weekStart, currentMonth) ? weekStart : currentMonth;
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
              (isBefore(postDate, monthEndExclusive) ||
                isBefore(postDate, weekEndExclusive)) &&
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
  }, [currentMonth, monthEndExclusive, userId, weekEndExclusive, weekStart]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(null);
      return;
    }
    if (selectedDate && isSameDay(selectedDate, date)) {
      setSelectedDate(null);
      return;
    }
    if (viewMode === "monthly") {
      setMonthlyDisplayDate(startOfMonth(date));
    }
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
              {viewMode === "weekly" ? "Weekly Grace" : "Monthly Grace"}
            </p>
            <h3 className="mt-0.5 text-[18px] font-bold tracking-tight text-[#4A433D]">
              {headerLabel}
            </h3>
          </div>

          <div className="flex items-center rounded-full bg-[#F5F3F0] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("weekly")}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-200",
                viewMode === "weekly"
                  ? "bg-white text-[#4A433D] shadow-sm"
                  : "text-[#9CA3AF] hover:text-[#6B7280]",
              )}
            >
              주간
            </button>
            <button
              type="button"
              onClick={() => setViewMode("monthly")}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-200",
                viewMode === "monthly"
                  ? "bg-white text-[#4A433D] shadow-sm"
                  : "text-[#9CA3AF] hover:text-[#6B7280]",
              )}
            >
              월간
            </button>
          </div>
        </div>

        {viewMode === "monthly" && (
          <div className="flex items-center justify-between gap-2 pb-2">
            <button
              type="button"
              onClick={() =>
                setMonthlyDisplayDate((current) => addMonths(current, -1))
              }
              className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB]"
            >
              이전 달
            </button>
            <button
              type="button"
              onClick={() =>
                setMonthlyDisplayDate((current) =>
                  isSameMonth(current, todayMonth)
                    ? current
                    : addMonths(current, 1),
                )
              }
              disabled={isSameMonth(currentMonth, todayMonth)}
              className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB] disabled:cursor-default disabled:text-[#C7CBD1] disabled:hover:bg-white"
            >
              다음 달
            </button>
          </div>
        )}

        <div className="min-w-0 overflow-hidden pb-4">
          <DayPicker
            mode="single"
            locale={ko}
            weekStartsOn={WEEK_STARTS_ON}
            month={viewMode === "monthly" ? currentMonth : weekStart}
            selected={selectedDate ?? undefined}
            onSelect={handleSelect}
            onMonthChange={setMonthlyDisplayDate}
            hideNavigation
            showOutsideDays={viewMode === "weekly"}
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
                  variant={viewMode}
                  completedDates={completedDates}
                  completedPostCountByDate={completedPostCountByDate}
                />
              ),
              ...(viewMode === "weekly"
                ? {
                    Week: (props) => (
                      <WeeklyRow {...props} visibleWeekStart={weekStart} />
                    ),
                  }
                : {}),
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
