"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
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
import HomeWeeklyPlannerModal from "@/features/home/HomeWeeklyPlannerModal";
import {
  localPlannerPlanRepository,
  type PlannerPlanMap,
} from "@/features/home/plannerPlanRepository";
import { useDraftPostStore } from "@/store/CreatePostStore";
import type { Category } from "@/types/Categories";
import type { CategoryCount } from "@/types/Post";
import type { PostsData } from "@/types/responses";

type HomeWeeklyPlannerProps = {
  userId: string;
  categories: Category[];
  categoryCounts: CategoryCount[];
};

type ViewMode = "weekly" | "monthly";
type DayStatus = "past" | "today" | "future";

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

function getDayStatus(date: Date): DayStatus {
  if (isToday(date)) return "today";
  return isBefore(startOfDay(date), startOfDay(new Date())) ? "past" : "future";
}

function getCompletedPlannedCount(
  dates: string[],
  plans: PlannerPlanMap,
  completedCategoriesByDate: Record<string, string[]>,
) {
  return dates.reduce((count, dateKey) => {
    const plannedCategories = plans[dateKey]?.categories ?? [];
    const completedCategories = new Set(completedCategoriesByDate[dateKey] ?? []);

    return (
      count +
      plannedCategories.filter((category) => completedCategories.has(category))
        .length
    );
  }, 0);
}

function getCompletedCount(
  dates: string[],
  completedPostCountByDate: Record<string, number>,
) {
  return dates.reduce(
    (count, dateKey) => count + (completedPostCountByDate[dateKey] ?? 0),
    0,
  );
}

function getCompletedPlannedDates(
  dates: string[],
  plans: PlannerPlanMap,
  completedCategoriesByDate: Record<string, string[]>,
) {
  return new Set(
    dates.filter((dateKey) => {
      const plannedCategories = plans[dateKey]?.categories ?? [];
      const completedCategories = new Set(completedCategoriesByDate[dateKey] ?? []);

      return plannedCategories.some((category) => completedCategories.has(category));
    }),
  );
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
    <div className="mt-1 flex min-h-[8px] translate-y-1 items-center justify-center gap-1">
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
  completedPlannedDates,
  className,
  ...buttonProps
}: DayButtonProps & {
  variant: ViewMode;
  plannedDates: Set<string>;
  completedDates: Set<string>;
  completedPlannedDates: Set<string>;
}) {
  const date = day.date;
  const dateKey = getDateKey(date);
  const dayIndex = getDayIndex(date);
  const isSelected = Boolean(modifiers.selected);
  const isPast = startOfDay(date) < startOfDay(new Date()) && !isToday(date);
  const isWeekend = dayIndex >= 5;
  const hasPlanned = plannedDates.has(dateKey);
  const hasCompleted = completedDates.has(dateKey);
  const hasCompletedPlanned = completedPlannedDates.has(dateKey);
  const shouldDimPast = isPast && !isSelected;

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
            : hasCompletedPlanned
              ? "bg-[#FFF8D9] hover:bg-[#FFF3BF]"
            : isToday(date)
              ? "bg-[#FFF4EC] ring-1 ring-[#D96B2B]/35"
              : "bg-[#F5F3F0] hover:bg-[#EEE8E1]",
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
                    : "text-[#4A433D]",
            shouldDimPast && "opacity-55",
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
        className,
        "flex h-[58px] w-full flex-col items-center justify-center gap-1 rounded-[14px] px-1 py-2 transition-all duration-200 active:scale-95",
        isSelected
          ? "bg-[#6B625A] shadow-md shadow-black/15"
          : hasCompletedPlanned
            ? "bg-[#FFF8D9] hover:bg-[#FFF3BF]"
          : isToday(date)
            ? "bg-[#FFF4EC] ring-1 ring-[#D96B2B]/35"
            : "bg-[#F5F3F0] hover:bg-[#EEE8E1]",
        modifiers.outside && "opacity-35",
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
                  : "text-[#4A433D]",
          isWeekend && !isSelected && "font-extrabold",
          shouldDimPast && !modifiers.outside && "opacity-55",
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

export default function HomeWeeklyPlanner({
  userId,
  categories,
  categoryCounts,
}: HomeWeeklyPlannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();
  const today = useMemo(() => new Date(), []);
  const currentWeekStart = useMemo(
    () => startOfWeek(today, { weekStartsOn: WEEK_STARTS_ON }),
    [today],
  );
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [monthlyDisplayDate, setMonthlyDisplayDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [plans, setPlans] = useState<PlannerPlanMap>({});
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
  const selectedPlan = selectedDateKey ? plans[selectedDateKey] : undefined;
  const selectedCategories = selectedPlan?.categories ?? [];
  const selectedCompletedCategories = selectedDateKey
    ? (completedCategoriesByDate[selectedDateKey] ?? [])
    : [];
  const selectedDayStatus = selectedDate ? getDayStatus(selectedDate) : null;
  const isPastSelectedDate = selectedDate
    ? startOfDay(selectedDate) < startOfDay(today) && !isToday(selectedDate)
    : false;
  const categoryCountMap = useMemo(
    () =>
      new Map(
        categoryCounts.map((item) => [item.category, item.count] as const),
      ),
    [categoryCounts],
  );
  const plannedDates = useMemo(
    () =>
      new Set(
        Object.values(plans)
          .filter((entry) => entry.categories.length > 0)
          .map((entry) => entry.date),
      ),
    [plans],
  );
  const weeklyDateKeys = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        getDateKey(addDays(weekStart, index)),
      ),
    [weekStart],
  );
  const monthlyDateKeys = useMemo(() => {
    const keys: string[] = [];

    for (
      let cursor = currentMonth;
      !isBefore(monthEnd, cursor);
      cursor = addDays(cursor, 1)
    ) {
      keys.push(getDateKey(cursor));
    }

    return keys;
  }, [currentMonth, monthEnd]);
  const completedPlannedDates = useMemo(
    () =>
      viewMode === "weekly"
        ? getCompletedPlannedDates(weeklyDateKeys, plans, completedCategoriesByDate)
        : getCompletedPlannedDates(monthlyDateKeys, plans, completedCategoriesByDate),
    [completedCategoriesByDate, monthlyDateKeys, plans, viewMode, weeklyDateKeys],
  );
  const visibleCompletedPlannedCount = useMemo(
    () =>
      viewMode === "weekly"
        ? getCompletedPlannedCount(weeklyDateKeys, plans, completedCategoriesByDate)
        : getCompletedPlannedCount(monthlyDateKeys, plans, completedCategoriesByDate),
    [completedCategoriesByDate, monthlyDateKeys, plans, viewMode, weeklyDateKeys],
  );
  const visibleCompletedCount = useMemo(
    () =>
      viewMode === "weekly"
        ? getCompletedCount(weeklyDateKeys, completedPostCountByDate)
        : getCompletedCount(monthlyDateKeys, completedPostCountByDate),
    [completedPostCountByDate, monthlyDateKeys, viewMode, weeklyDateKeys],
  );

  const headerLabel =
    viewMode === "monthly"
      ? format(currentMonth, "yyyy년 M월", { locale: ko })
      : "이번 주 운동 계획";

  useEffect(() => {
    let isMounted = true;

    async function loadPlans() {
      const loadedPlans = await localPlannerPlanRepository.listPlans(userId);
      if (!isMounted) return;
      setPlans(loadedPlans);
    }

    loadPlans();

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== `home-planner-plans:${userId}`) return;
      loadPlans();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, [userId]);

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
              isBefore(postDate, monthEndExclusive) ||
              isBefore(postDate, weekEndExclusive)
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
        console.error("Failed to fetch planner completion", error);
      }
    }

    fetchCompletedStatus();

    return () => controller.abort();
  }, [currentMonth, monthEndExclusive, userId, weekEndExclusive, weekStart]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    if (viewMode === "monthly") {
      setMonthlyDisplayDate(date);
    }
    setSelectedDate(date);
  };

  const handleToggleCategory = async (category: Category) => {
    if (!selectedDateKey || isPastSelectedDate) return;

    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];

    setPlans((current) => {
      const nextPlans = { ...current };

      if (nextCategories.length === 0) {
        delete nextPlans[selectedDateKey];
      } else {
        nextPlans[selectedDateKey] = {
          date: selectedDateKey,
          categories: nextCategories,
          updatedAt: new Date().toISOString(),
        };
      }

      return nextPlans;
    });

    try {
      const savedPlans = await localPlannerPlanRepository.upsertPlan(
        userId,
        selectedDateKey,
        nextCategories,
      );
      setPlans(savedPlans);
    } catch (error) {
      console.error("Failed to save planner plan", error);
      const restoredPlans = await localPlannerPlanRepository.listPlans(userId);
      setPlans(restoredPlans);
    }
  };

  const moveToArchive = () => {
    if (!selectedDate) return;

    setSelectedDate(null);
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

  const handleWriteCategory = (category: Category) => {
    resetPost();
    setPost({
      category,
      categoryCount: categoryCountMap.get(category) ?? 0,
    });

    router.push(pathname.startsWith("/m/") ? "/m/post/create" : "/post/create");
  };

  return (
    <>
      <section className="mx-5 overflow-hidden rounded-[24px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.07)] ring-1 ring-[#F0EBE3] sm:mx-auto sm:w-full sm:max-w-[640px]">
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
              {viewMode === "weekly" ? "Weekly Plan" : "Monthly Plan"}
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
          <div className="flex items-center justify-between gap-2 px-5 pb-2">
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
                setMonthlyDisplayDate((current) => addMonths(current, 1))
              }
              className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#4A433D] shadow-sm ring-1 ring-[#E5E7EB] transition-all duration-200 hover:bg-[#F9FAFB]"
            >
              다음 달
            </button>
          </div>
        )}

        <div className="px-4 pb-4 sm:px-5">
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
            styles={{
              month_grid: {
                tableLayout: "fixed",
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
              root: "w-full",
              months: "w-full",
              month: "w-full",
              month_caption: "hidden",
              month_grid: "w-full table-fixed border-separate border-spacing-[4px]",
              weekdays:
                "[&_th:nth-child(6)]:text-[#3B82F6] [&_th:nth-child(7)]:text-[#EF4444]",
              weekday: "h-8 text-center text-[11px] font-bold text-[#9CA3AF]",
              week: "",
              day: "p-0 align-middle",
              day_button: "w-full",
            }}
            formatters={{
              formatWeekdayName: (date) => DAY_LABELS[getDayIndex(date)],
            }}
            components={{
              DayButton: (props) => (
                <PlannerDayButton
                  {...props}
                  variant={viewMode}
                  plannedDates={plannedDates}
                  completedDates={completedDates}
                  completedPlannedDates={completedPlannedDates}
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

        <div className="flex justify-end px-5 pb-4">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[#FFF4EC] px-3 py-1.5 text-[12px] font-semibold text-[#D96B2B]">
              <span>{viewMode === "weekly" ? "이번 주" : "이번 달"} 완료한 운동</span>
              <span className="font-bold text-[#4A433D]">
                {visibleCompletedCount}
              </span>
              <span>개</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#FFF8D9] px-3 py-1.5 text-[12px] font-semibold text-[#8A5A14]">
              <span>{viewMode === "weekly" ? "이번 주" : "이번 달"} 완료한 운동 계획</span>
              <span className="font-bold text-[#4A433D]">
                {visibleCompletedPlannedCount}
              </span>
              <span>개</span>
            </div>
          </div>
        </div>
      </section>

      <HomeWeeklyPlannerModal
        selectedDate={selectedDate}
        dayStatus={selectedDayStatus}
        plannedCategories={selectedCategories}
        completedCategories={selectedCompletedCategories}
        allCategories={categories}
        onClose={() => setSelectedDate(null)}
        onToggleCategory={handleToggleCategory}
        onWriteCategory={handleWriteCategory}
        onMoveToArchive={moveToArchive}
      />
    </>
  );
}
