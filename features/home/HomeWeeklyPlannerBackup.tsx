// Deprecated

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addWeeks,
  differenceInCalendarWeeks,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  DayPicker,
  type DayButtonProps,
  type WeekProps,
} from "react-day-picker";
import { usePathname, useRouter } from "next/navigation";
import { useDraftPostStore } from "@/store/CreatePostStore";
import type { Category } from "@/types/Categories";
import { categories as ALL_CATEGORIES } from "@/types/Categories";
import type { CategoryCount } from "@/types/Post";
import type { PostsData } from "@/types/responses";

type HomeWeeklyPlannerProps = {
  userId: string;
  categories: Category[];
  categoryCounts: CategoryCount[];
};

type WeeklyPlan = Record<number, Category[]>;
type ViewMode = "weekly" | "monthly";
type DayStatus = "past" | "today" | "future";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const PAGE_SIZE = 30;
const WEEK_STARTS_ON = 1 as const;

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function createEmptyPlan(): WeeklyPlan {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
}

function getStorageKey(userId: string, weekStartDate: Date) {
  return `home-weekly-plan:${userId}:${format(weekStartDate, "yyyy-MM-dd")}`;
}

function getCompletedKey(dayIndex: number, category: string) {
  return `${dayIndex}:${category}`;
}

function getDayIndex(date: Date) {
  const day = getDay(date);
  return day === 0 ? 6 : day - 1;
}

function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

function getDayStatus(date: Date): DayStatus {
  if (isToday(date)) return "today";
  return isBefore(date, new Date()) ? "past" : "future";
}

function readStoredPlan(userId: string, weekStartDate: Date): WeeklyPlan {
  try {
    const saved = window.localStorage.getItem(
      getStorageKey(userId, weekStartDate),
    );
    if (!saved) return createEmptyPlan();
    return { ...createEmptyPlan(), ...(JSON.parse(saved) as WeeklyPlan) };
  } catch (error) {
    console.error("Failed to read weekly plan", error);
    return createEmptyPlan();
  }
}

function DayDots({
  hasPlanned,
  hasCompleted,
  bright,
}: {
  hasPlanned: boolean;
  hasCompleted: boolean;
  bright?: boolean;
}) {
  return (
    <div className="flex min-h-[8px] items-center justify-center gap-1">
      {hasPlanned && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            bright ? "bg-white/55" : "bg-[#C9C1B6]",
          )}
        />
      )}
      {hasCompleted && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            bright ? "bg-[#FCD6BE]" : "bg-[#D96B2B]",
          )}
        />
      )}
    </div>
  );
}

function PlannerDayButton({
  day,
  modifiers,
  variant,
  plannedDates,
  completedDates,
  ...buttonProps
}: DayButtonProps & {
  variant: ViewMode;
  plannedDates: Set<string>;
  completedDates: Set<string>;
}) {
  const date = day.date;
  const dateKey = format(date, "yyyy-MM-dd");
  const dayIndex = getDayIndex(date);
  const isSelected = Boolean(modifiers.selected);
  const isPast = isBefore(date, new Date()) && !isToday(date);
  const isWeekend = dayIndex >= 5;
  const isFuture = isBefore(new Date(), date) && !isToday(date);
  const hasPlanned = plannedDates.has(dateKey);
  const hasCompleted = completedDates.has(dateKey);

  if (variant === "weekly") {
    return (
      <button
        {...buttonProps}
        type="button"
        className={cn(
          "flex h-[88px] w-full flex-col items-center justify-center gap-1.5 rounded-[18px] px-1 py-3 transition-all duration-200 active:scale-95",
          isSelected
            ? "bg-[#1A1A1A] shadow-lg shadow-black/15"
            : isToday(date)
              ? "bg-[#FFF4EC] ring-1.5 ring-[#D96B2B]/35"
              : "bg-[#F5F3F0] hover:bg-[#EEE8E1]",
          isPast && !isSelected && "opacity-55",
        )}
      >
        <span
          className={cn(
            "text-[18px] font-extrabold leading-none",
            isSelected
              ? "text-white"
              : isToday(date)
                ? "text-[#D96B2B]"
                : dayIndex === 6
                  ? "text-[#EF4444]"
                  : dayIndex === 5
                    ? "text-[#3B82F6]"
                    : "text-[#1A1A1A]",
          )}
        >
          {format(date, "d")}
        </span>
        <DayDots
          hasPlanned={hasPlanned}
          hasCompleted={hasCompleted}
          bright={isSelected}
        />
      </button>
    );
  }

  return (
    <button
      {...buttonProps}
      type="button"
      className={cn(
        "flex h-[62px] w-full flex-col items-center justify-center gap-1 rounded-[14px] px-1 py-2 transition-all duration-200 active:scale-95",
        isSelected
          ? "bg-[#1A1A1A] shadow-md shadow-black/15"
          : isToday(date)
            ? "bg-[#FFF4EC] ring-1 ring-[#D96B2B]/35"
            : "bg-[#F5F3F0] hover:bg-[#EEE8E1]",
        modifiers.outside && "opacity-35",
        isPast && !isSelected && !modifiers.outside && "opacity-55",
        isFuture && "bg-[#F8F6F3]",
      )}
    >
      <span
        className={cn(
          "text-[13px] font-bold leading-none",
          isSelected
            ? "text-white"
            : isToday(date)
              ? "text-[#D96B2B]"
              : dayIndex === 6
                ? "text-[#EF4444]"
                : dayIndex === 5
                  ? "text-[#3B82F6]"
                  : "text-[#1A1A1A]",
          isWeekend && !isSelected && "font-extrabold",
        )}
      >
        {format(date, "d")}
      </span>
      <DayDots
        hasPlanned={hasPlanned}
        hasCompleted={hasCompleted}
        bright={isSelected}
      />
    </button>
  );
}

function TagList({
  title,
  emptyText,
  tone,
  values,
}: {
  title: string;
  emptyText: string;
  tone: "neutral" | "completed";
  values: string[];
}) {
  return (
    <div>
      <p className="mb-2.5 text-[12px] font-semibold text-[#9CA3AF]">{title}</p>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] font-semibold",
                tone === "completed"
                  ? "bg-[#FFF4EC] text-[#D96B2B] ring-1 ring-[#D96B2B]/20"
                  : "bg-[#F5F3F0] text-[#4B5563] ring-1 ring-[#D1C9BE]/30",
              )}
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-[#C8C0B4]">{emptyText}</p>
      )}
    </div>
  );
}

export default function HomeWeeklyPlanner({
  userId,
  categories,
  categoryCounts,
}: HomeWeeklyPlannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobilePath = pathname.startsWith("/m/");
  const nickName =
    pathname
      .split("/")
      .filter(Boolean)
      .find((segment) => !["m", "home", "post"].includes(segment)) ?? "";

  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [plan, setPlan] = useState<WeeklyPlan>(createEmptyPlan);
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [weeklyCompletedCount, setWeeklyCompletedCount] = useState(0);
  const [weeklyCompletedDaysCount, setWeeklyCompletedDaysCount] = useState(0);
  const [monthlyCompletedCount, setMonthlyCompletedCount] = useState(0);
  const [monthlyPlannedCount, setMonthlyPlannedCount] = useState(0);
  const [monthlyPlannedDates, setMonthlyPlannedDates] = useState<Set<string>>(
    new Set(),
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [showExtraPicker, setShowExtraPicker] = useState(false);

  const today = useMemo(() => new Date(), []);
  const actualWeekStart = useMemo(
    () => startOfWeek(today, { weekStartsOn: WEEK_STARTS_ON }),
    [today],
  );
  const monthStart = useMemo(() => startOfMonth(today), [today]);
  const monthEnd = useMemo(() => endOfMonth(today), [today]);

  const weekStart = useMemo(
    () =>
      weekOffset === 0
        ? actualWeekStart
        : addWeeks(actualWeekStart, weekOffset),
    [actualWeekStart, weekOffset],
  );
  const weekDays = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekEndExclusive = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const monthEndExclusive = useMemo(() => addDays(monthEnd, 1), [monthEnd]);
  const storageKey = useMemo(
    () => getStorageKey(userId, weekStart),
    [userId, weekStart],
  );
  const isCurrentWeek = weekOffset === 0;
  const createPostPath = isMobilePath ? "/m/post/create" : "/post/create";
  const homePath = `${isMobilePath ? "/m" : ""}/${nickName}/home`;

  const categoryCountMap = useMemo(
    () =>
      new Map(
        categoryCounts.map((item) => [item.category, item.count] as const),
      ),
    [categoryCounts],
  );
  const extraCategories = useMemo(
    () =>
      (ALL_CATEGORIES as readonly Category[]).filter(
        (category) => !categories.includes(category),
      ),
    [categories],
  );

  const selectedDayIndex = selectedDate ? getDayIndex(selectedDate) : null;
  const selectedItems =
    selectedDayIndex !== null ? (plan[selectedDayIndex] ?? []) : [];
  const selectedDayStatus = selectedDate ? getDayStatus(selectedDate) : null;

  const completedCategoriesByDay = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const key of completedKeys) {
      const [indexText, category] = key.split(":");
      const index = Number(indexText);
      const values = map.get(index) ?? new Set<string>();
      values.add(category);
      map.set(index, values);
    }
    return map;
  }, [completedKeys]);

  const completedForSelectedDay =
    selectedDayIndex !== null
      ? Array.from(completedCategoriesByDay.get(selectedDayIndex) ?? [])
      : [];
  const completedForSelectedSet =
    selectedDayIndex !== null
      ? (completedCategoriesByDay.get(selectedDayIndex) ?? new Set<string>())
      : new Set<string>();

  const weeklyPlannedCount = useMemo(
    () =>
      weekDays.reduce(
        (count, _, index) => count + (plan[index]?.length ?? 0),
        0,
      ),
    [plan, weekDays],
  );
  const weeklyPlannedDates = useMemo(() => {
    const dates = new Set<string>();
    weekDays.forEach((day, index) => {
      if ((plan[index] ?? []).length > 0) {
        dates.add(format(day, "yyyy-MM-dd"));
      }
    });
    return dates;
  }, [plan, weekDays]);
  const weeklyCompletedDates = useMemo(() => {
    const dates = new Set<string>();
    for (const index of completedCategoriesByDay.keys()) {
      const day = weekDays[index];
      if (day) {
        dates.add(format(day, "yyyy-MM-dd"));
      }
    }
    return dates;
  }, [completedCategoriesByDay, weekDays]);
  const isWeeklyView = viewMode === "weekly";
  const visiblePlannedCount = isWeeklyView
    ? weeklyPlannedCount
    : monthlyPlannedCount;
  const visibleCompletedCount = isWeeklyView
    ? weeklyCompletedCount
    : monthlyCompletedCount;
  const visiblePlannedDates = isWeeklyView
    ? weeklyPlannedDates
    : monthlyPlannedDates;
  const visibleCompletedDates = isWeeklyView
    ? weeklyCompletedDates
    : completedDates;

  useEffect(() => {
    setLoadedStorageKey(null);
    setPlan(readStoredPlan(userId, weekStart));
    setLoadedStorageKey(storageKey);
  }, [storageKey, userId, weekStart]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(plan));
    } catch (error) {
      console.error("Failed to save weekly plan", error);
    }
  }, [loadedStorageKey, plan, storageKey]);

  useEffect(() => {
    if (!userId) return;

    const cache = new Map<string, WeeklyPlan>();
    const nextPlannedDates = new Set<string>();
    let nextPlannedCount = 0;

    for (
      let cursor = monthStart;
      !isBefore(monthEnd, cursor);
      cursor = addDays(cursor, 1)
    ) {
      const cursorWeekStart = startOfWeek(cursor, {
        weekStartsOn: WEEK_STARTS_ON,
      });
      const cursorStorageKey = getStorageKey(userId, cursorWeekStart);
      let weeklyPlan = cache.get(cursorStorageKey);

      if (!weeklyPlan) {
        weeklyPlan =
          loadedStorageKey === cursorStorageKey
            ? plan
            : readStoredPlan(userId, cursorWeekStart);
        cache.set(cursorStorageKey, weeklyPlan);
      }

      const dayItems = weeklyPlan[getDayIndex(cursor)] ?? [];
      if (dayItems.length > 0) {
        nextPlannedDates.add(format(cursor, "yyyy-MM-dd"));
        nextPlannedCount += dayItems.length;
      }
    }

    setMonthlyPlannedDates(nextPlannedDates);
    setMonthlyPlannedCount(nextPlannedCount);
  }, [loadedStorageKey, monthEnd, monthStart, plan, userId]);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function fetchPlannerStatus() {
      try {
        const nextCompletedKeys = new Set<string>();
        const nextCompletedDates = new Set<string>();
        const weeklyCompletedDays = new Set<number>();
        const fetchFloor = isBefore(weekStart, monthStart)
          ? weekStart
          : monthStart;
        let nextWeeklyCompletedCount = 0;
        let nextMonthlyCompletedCount = 0;
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
            throw new Error("Failed to fetch planner posts");
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
              !isBefore(postDate, monthStart) &&
              isBefore(postDate, monthEndExclusive)
            ) {
              nextCompletedDates.add(format(postDate, "yyyy-MM-dd"));
              nextMonthlyCompletedCount += 1;
            }

            if (
              !isBefore(postDate, weekStart) &&
              isBefore(postDate, weekEndExclusive)
            ) {
              const dayIndex = getDayIndex(postDate);
              nextCompletedKeys.add(getCompletedKey(dayIndex, post.category));
              weeklyCompletedDays.add(dayIndex);
              nextWeeklyCompletedCount += 1;
            }
          }

          if (reachedBeforeFloor || data.last) break;
          page += 1;
        }

        setCompletedKeys(nextCompletedKeys);
        setCompletedDates(nextCompletedDates);
        setWeeklyCompletedCount(nextWeeklyCompletedCount);
        setWeeklyCompletedDaysCount(weeklyCompletedDays.size);
        setMonthlyCompletedCount(nextMonthlyCompletedCount);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Failed to fetch planner completion", error);
      }
    }

    fetchPlannerStatus();

    return () => controller.abort();
  }, [monthEndExclusive, monthStart, userId, weekEndExclusive, weekStart]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    const openSelectedDay = () => {
      setSelectedDate(date);
      setShowExtraPicker(false);
      setIsPanelOpen(true);
    };

    if (viewMode === "monthly") {
      const targetWeekStart = startOfWeek(date, {
        weekStartsOn: WEEK_STARTS_ON,
      });
      const nextOffset = differenceInCalendarWeeks(
        targetWeekStart,
        actualWeekStart,
        {
          weekStartsOn: WEEK_STARTS_ON,
        },
      );

      setWeekOffset(nextOffset);
      requestAnimationFrame(openSelectedDay);
      return;
    }

    openSelectedDay();
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setShowExtraPicker(false);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setSelectedDate(null);
    }, 300);
  };

  const toggleCategory = (dayIndex: number, category: Category) => {
    setPlan((current) => {
      const currentItems = current[dayIndex] ?? [];
      const nextItems = currentItems.includes(category)
        ? currentItems.filter((item) => item !== category)
        : [...currentItems, category];

      return { ...current, [dayIndex]: nextItems };
    });
  };

  const toggleSelectedCategory = (category: Category) => {
    if (selectedDayIndex === null) return;
    toggleCategory(selectedDayIndex, category);
  };

  const handleWrite = (category: Category) => {
    if (selectedDayIndex === null) return;

    resetPost();
    setPost({
      category,
      categoryCount: categoryCountMap.get(category) ?? 0,
    });
    window.sessionStorage.setItem(
      "home-weekly-plan:last-opened",
      JSON.stringify({ dayIndex: selectedDayIndex, category }),
    );
    router.push(createPostPath);
  };

  const moveToArchive = () => {
    closePanel();
    const dateText = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
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

    router.push(`${homePath}?date=${dateText}#record-archive`);
  };

  const dayPickerClassNames = {
    root: "w-full",
    months: "w-full",
    month: "w-full",
    month_caption: "hidden",
    month_grid: "w-full border-separate border-spacing-[4px]",
    weekdays:
      "[&_th:nth-child(6)]:text-[#3B82F6] [&_th:nth-child(7)]:text-[#EF4444]",
    weekday: "h-8 text-center text-[11px] font-bold text-[#9CA3AF]",
    weeks: "",
    week: "",
    day: "p-0 align-middle",
    day_button: "w-full",
  } as const;

  const weeklyWeekComponent = (props: WeekProps) => {
    const { week, ...trProps } = props;
    const isVisibleWeek = week.days.some((value) =>
      isSameDay(
        startOfWeek(value.date, { weekStartsOn: WEEK_STARTS_ON }),
        weekStart,
      ),
    );

    return (
      <tr
        {...trProps}
        className={cn(trProps.className, !isVisibleWeek && "hidden")}
      />
    );
  };

  return (
    <>
      <section className="mx-5 overflow-hidden rounded-[24px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.07)] ring-1 ring-[#F0EBE3] sm:mx-auto sm:w-full sm:max-w-[640px]">
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
              Weekly Plan
            </p>
            <h3 className="mt-0.5 text-[18px] font-bold tracking-tight text-[#1A1A1A]">
              {viewMode === "monthly"
                ? format(monthStart, "yyyy년 M월", { locale: ko })
                : isCurrentWeek
                  ? "이번 주 운동 계획"
                  : `${format(weekStart, "M월 d일")} 주차`}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center rounded-full bg-[#F5F3F0] p-0.5">
              {[
                { label: "월간", mode: "monthly" as const },
                { label: "주간", mode: "weekly" as const },
              ].map(({ label, mode }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setViewMode(mode);
                    closePanel();
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-200",
                    viewMode === mode
                      ? "bg-white text-[#1A1A1A] shadow-sm"
                      : "text-[#9CA3AF] hover:text-[#6B7280]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {viewMode === "weekly" && weeklyCompletedDaysCount > 0 && (
              <span className="rounded-full bg-[#FFF0E5] px-2.5 py-0.5 text-[11px] font-bold text-[#D96B2B]">
                {weeklyCompletedDaysCount}일 실행
              </span>
            )}
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-5">
          <DayPicker
            mode="single"
            selected={isPanelOpen ? (selectedDate ?? undefined) : undefined}
            onSelect={handleDaySelect}
            locale={ko}
            month={isWeeklyView ? weekStart : monthStart}
            weekStartsOn={WEEK_STARTS_ON}
            hideNavigation
            showOutsideDays={isWeeklyView}
            classNames={dayPickerClassNames}
            formatters={{
              formatWeekdayName: (date) => DAY_LABELS[getDayIndex(date)],
            }}
            components={{
              ...(isWeeklyView ? { Week: weeklyWeekComponent } : {}),
              DayButton: (props) => (
                <PlannerDayButton
                  {...props}
                  variant={viewMode}
                  plannedDates={visiblePlannedDates}
                  completedDates={visibleCompletedDates}
                />
              ),
            }}
          />
        </div>

        <div className="flex items-center justify-between border-t border-[#F0EBE3] bg-[#FCFCFA] px-5 py-3.5 text-[13px] font-medium text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9C1B6]" />
            계획한 운동{" "}
            <span className="font-bold text-[#1A1A1A]">
              {visiblePlannedCount}
            </span>
            개
          </div>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D96B2B]" />
            실행한 운동{" "}
            <span className="font-bold text-[#1A1A1A]">
              {visibleCompletedCount}
            </span>
            개
          </div>
        </div>
      </section>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          isPanelOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closePanel}
      />

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out sm:left-1/2 sm:right-auto sm:w-full sm:max-w-[640px] sm:-translate-x-1/2",
          isPanelOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            {selectedDate && (
              <>
                <p className="text-[12px] font-bold text-[#D96B2B]">
                  {DAY_LABELS[getDayIndex(selectedDate)]}요일
                </p>
                <h4 className="text-[20px] font-extrabold text-[#1A1A1A]">
                  {format(selectedDate, "M월 d일")}
                </h4>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={closePanel}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F5] text-[#6B7280] transition-colors hover:bg-[#E5E7EB]"
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mx-5 h-px bg-[#F3F4F6]" />

        {selectedDayStatus === "past" ? (
          <div className="px-5 pt-4 pb-6">
            <div className="mb-6 flex flex-col gap-4">
              <TagList
                title="당시 계획했던 운동"
                emptyText="계획된 운동이 없었습니다"
                tone="neutral"
                values={selectedItems}
              />
              <TagList
                title="실제 기록한 운동"
                emptyText="기록된 운동이 없습니다"
                tone="completed"
                values={completedForSelectedDay}
              />
            </div>

            <button
              type="button"
              onClick={moveToArchive}
              className="flex w-full items-center justify-between rounded-[16px] bg-[#1A1A1A] px-4 py-3.5 text-left transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">
                    나의 기록 보관소 보기
                  </p>
                  <p className="text-[11px] text-white/40">
                    {selectedDate ? format(selectedDate, "M월 d일") : ""} 기록
                    확인
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#1A1A1A]">
                보러가기
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="h-3 w-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
            </button>
          </div>
        ) : selectedDayStatus ? (
          <>
            <div className="px-5 pt-4 pb-3">
              <p className="mb-3 text-[12px] font-semibold text-[#9CA3AF]">
                {selectedDayStatus === "today"
                  ? selectedItems.length > 0
                    ? "오늘 할 운동"
                    : "운동을 추가해보세요"
                  : selectedItems.length > 0
                    ? "예정된 운동"
                    : "운동을 계획해보세요"}
              </p>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedItems.includes(category);
                  const isCompleted = completedForSelectedSet.has(category);

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        if (selectedDayStatus === "today" && isSelected) {
                          handleWrite(category);
                          return;
                        }
                        toggleSelectedCategory(category);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95",
                        isCompleted
                          ? "bg-[#D96B2B] text-white shadow-md shadow-[#D96B2B]/25"
                          : isSelected
                            ? "bg-[#1A1A1A] text-white"
                            : "border border-dashed border-[#D1C9BE] bg-white text-[#9CA3AF] hover:border-[#D96B2B] hover:text-[#D96B2B]",
                      )}
                    >
                      <span>{category}</span>
                    </button>
                  );
                })}

                {extraCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowExtraPicker((current) => !current)}
                    className="flex items-center gap-1 rounded-full border border-dashed border-[#D1C9BE] bg-white px-3 py-2 text-[13px] font-semibold text-[#9CA3AF] transition-all hover:border-[#D96B2B] hover:text-[#D96B2B] active:scale-95"
                  >
                    {showExtraPicker ? "닫기" : "다른 종목"}
                  </button>
                )}
              </div>

              {showExtraPicker && extraCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {extraCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        toggleSelectedCategory(category);
                        setShowExtraPicker(false);
                      }}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all active:scale-95",
                        selectedItems.includes(category)
                          ? "bg-[#1A1A1A] text-white"
                          : "bg-[#F5F3F0] text-[#4B5563] hover:bg-[#EDE9E4]",
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedDayStatus === "today" && selectedItems.length > 0 && (
              <>
                <div className="mx-5 mt-2 h-px bg-[#F3F4F6]" />
                <div className="px-5 pt-3 pb-5">
                  <p className="mb-2.5 text-[12px] font-semibold text-[#9CA3AF]">
                    어떤 운동부터 기록할까요?
                  </p>

                  <div className="flex flex-col gap-2">
                    {selectedItems.map((item) => {
                      const isCompleted = completedForSelectedSet.has(item);

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleWrite(item)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[16px] px-4 py-3.5 text-left transition-all active:scale-[0.98]",
                            isCompleted
                              ? "bg-[#FFF4EC] ring-1 ring-[#F6C89A]"
                              : "bg-[#1A1A1A]",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full",
                                isCompleted ? "bg-[#D96B2B]" : "bg-white/10",
                              )}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="white"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d={
                                    isCompleted
                                      ? "M4.5 12.75l6 6 9-13.5"
                                      : "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                                  }
                                />
                              </svg>
                            </div>

                            <div>
                              <p
                                className={cn(
                                  "text-[14px] font-bold",
                                  isCompleted ? "text-[#92400E]" : "text-white",
                                )}
                              >
                                {item}
                              </p>
                              <p
                                className={cn(
                                  "text-[11px]",
                                  isCompleted
                                    ? "text-[#D97706]"
                                    : "text-white/40",
                                )}
                              >
                                {isCompleted
                                  ? "오늘 완료!"
                                  : `총 ${categoryCountMap.get(item) ?? 0}회 기록`}
                              </p>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold",
                              isCompleted
                                ? "bg-[#D96B2B] text-white"
                                : "bg-white text-[#1A1A1A]",
                            )}
                          >
                            {isCompleted ? "다시 쓰기" : "바로 작성"}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              stroke="currentColor"
                              className="h-3 w-3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                              />
                            </svg>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        ) : null}

        <div className="h-6 h-safe-inset-bottom" />
      </div>
    </>
  );
}
