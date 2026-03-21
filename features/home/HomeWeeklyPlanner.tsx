"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  format,
  isBefore,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
  subWeeks,
  addWeeks,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  differenceInCalendarWeeks,
} from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter, usePathname } from "next/navigation";
import { useDraftPostStore } from "@/store/CreatePostStore";
import type { Category } from "@/types/Categories";
import type { CategoryCount } from "@/types/Post";
import type { PostsData } from "@/types/responses";
import { categories as ALL_CATEGORIES } from "@/types/Categories";

type HomeWeeklyPlannerProps = {
  userId: string;
  categories: Category[];
  categoryCounts: CategoryCount[];
};

type WeeklyPlan = Record<number, Category[]>;

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const PAGE_SIZE = 30;

function getStorageKey(userId: string, weekStartDate: Date) {
  return `home-weekly-plan:${userId}:${format(weekStartDate, "yyyy-MM-dd")}`;
}

function createEmptyPlan(): WeeklyPlan {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
}

export default function HomeWeeklyPlanner({
  userId,
  categories,
  categoryCounts,
}: HomeWeeklyPlannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  // pathname 예: /johnny/home 또는 /m/johnny/home
  const nickName = pathname.split("/").filter(Boolean).find((seg) => seg !== "m" && seg !== "home" && seg !== "post") ?? "";

  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();

  const [plan, setPlan] = useState<WeeklyPlan>(createEmptyPlan);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());
  // completedDates: YYYY-MM-DD strings for any day that has a post (for monthly view)
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [showExtraPicker, setShowExtraPicker] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  const actualWeekStart = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    [],
  );

  const weekStart = useMemo(
    () => weekOffset === 0 ? actualWeekStart : addWeeks(actualWeekStart, weekOffset),
    [actualWeekStart, weekOffset],
  );

  const isCurrentWeek = weekOffset === 0;

  // 월간 뷰의 날짜 목록
  const monthStart = useMemo(() => startOfMonth(new Date()), []);
  const monthEnd = useMemo(() => endOfMonth(new Date()), []);
  const monthDays = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd]);
  // 월 첫째 주 앞에 빈 칸 수 (0=일, 1=월, ...) - Tailwind grid 시작 offset
  const monthStartOffset = useMemo(() => {
    const raw = getDay(monthStart); // 0=일
    return raw === 0 ? 6 : raw - 1; // 월~일 기준
  }, [monthStart]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }).map((_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  // 오늘 날짜 자동 스크롤
  useEffect(() => {
    if (todayRef.current && stripRef.current) {
      const strip = stripRef.current;
      const todayEl = todayRef.current;
      const offset =
        todayEl.offsetLeft - strip.offsetWidth / 2 + todayEl.offsetWidth / 2;
      strip.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(getStorageKey(userId, weekStart));
      if (saved) {
        const parsed = JSON.parse(saved) as WeeklyPlan;
        setPlan({ ...createEmptyPlan(), ...parsed });
      } else {
        setPlan(createEmptyPlan());
      }
    } catch (error) {
      console.error("Failed to load weekly plan", error);
    } finally {
      setIsLoaded(true);
    }
  }, [userId, weekStart]);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(getStorageKey(userId, weekStart), JSON.stringify(plan));
    }
  }, [plan, userId, isLoaded, weekStart]);

  useEffect(() => {
    async function fetchWeeklyPosts() {
      try {
        const nextCompleted = new Set<string>();
        const nextCompletedDates = new Set<string>();
        let page = 0;

        while (true) {
          const response = await fetch(
            `/api/members/getPosts?pageParam=${page}&size=${PAGE_SIZE}&id=${userId}&sort=DESC`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
            },
          );

          if (!response.ok) throw new Error("Failed to fetch weekly posts");

          const json = await response.json();
          const data = json.data as PostsData;

          if (!data?.content?.length) break;

          let reachedBefore = false;
          for (const post of data.content) {
            const postDate = parseISO(post.createdAt);
            // 월초보다 이전 날짜면 중단
            if (isBefore(postDate, monthStart)) {
              reachedBefore = true;
              break;
            }
            // 월간 날짜 저장
            nextCompletedDates.add(format(postDate, "yyyy-MM-dd"));
            // 위클리 키 저장
            if (!isBefore(postDate, weekStart)) {
              const dayIndex = weekDays.findIndex((day) => isSameDay(day, postDate));
              if (dayIndex >= 0) {
                nextCompleted.add(`${dayIndex}:${post.category}`);
              }
            }
          }

          if (reachedBefore || data.last) break;
          page += 1;
        }

        setCompletedKeys(nextCompleted);
        setCompletedDates(nextCompletedDates);
      } catch (error) {
        console.error("Failed to fetch weekly planner completion", error);
      }
    }

    if (userId) {
      fetchWeeklyPosts();
    }
  }, [userId, weekDays, weekStart, monthStart]);

  const toggleCategory = (dayIndex: number, category: Category) => {
    setPlan((current) => {
      const currentItems = current[dayIndex] ?? [];
      const nextItems = currentItems.includes(category)
        ? currentItems.filter((item) => item !== category)
        : [...currentItems, category];
      return { ...current, [dayIndex]: nextItems };
    });
  };

  const handleWrite = (dayIndex: number, category: Category) => {
    const count =
      categoryCounts.find((item) => item.category === category)?.count ?? 0;
    resetPost();
    setPost({ category, categoryCount: count });
    window.sessionStorage.setItem(
      "home-weekly-plan:last-opened",
      JSON.stringify({ dayIndex, category }),
    );
    router.push("/post/create");
  };

  const openPanel = (index: number) => {
    setSelectedDay(index);
    setIsPanelOpen(true);
  };

  // 월간 뷰에서 특정 날짜 선택 하면 해당 주로 전환 + 패널 오픈
  const openMonthDay = (day: Date) => {
    const dayWeekStart = startOfWeek(day, { weekStartsOn: 1 });
    const offset = differenceInCalendarWeeks(dayWeekStart, actualWeekStart, { weekStartsOn: 1 });
    // 미래 날짜는 이번 주로 채움
    const clampedOffset = Math.min(0, offset);
    const rawDayIndex = getDay(day); // 0=일, 1=월...
    const dayIndex = rawDayIndex === 0 ? 6 : rawDayIndex - 1; // 월=0, 일=6
    setWeekOffset(clampedOffset);
    setViewMode("weekly");
    // 주 전환 후 패널 오픈 (조성 시점 보정)
    requestAnimationFrame(() => {
      setSelectedDay(dayIndex);
      setIsPanelOpen(true);
    });
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedDay(null), 300);
  };

  const selectedItems = selectedDay !== null ? (plan[selectedDay] ?? []) : [];
  const selectedDate = selectedDay !== null ? weekDays[selectedDay] : null;

  // 오늘보다 이전이면 과거
  const isPastDay = selectedDate !== null && !isToday(selectedDate) && isBefore(selectedDate, new Date());

  // 과거 날짜의 현재주 completedKeys (해당 날짜에 완료된 운동 목록)
  const completedCatsForSelected = selectedDay !== null
    ? Array.from(completedKeys)
        .filter((k) => k.startsWith(`${selectedDay}:`))
        .map((k) => k.split(":")[1])
    : [];

  // 이번 주 완료된 날짜 수
  const completedDaysCount = weekDays.filter((_, i) =>
    (plan[i] ?? []).some((cat) => completedKeys.has(`${i}:${cat}`)),
  ).length;

  // 이번 주 총 계획된 운동 개수
  const totalPlannedCount = weekDays.reduce(
    (acc, _, i) => acc + (plan[i]?.length ?? 0),
    0
  );

  // 이번 주 총 완료한 운동 개수 (계획 여부 관계 없이 전체 누적 카운트)
  const totalCompletedCount = completedKeys.size;

  return (
    <>
      {/* ─── 위클리 캘린더 섹션 ─── */}
      <section className="mx-5 sm:mx-auto sm:max-w-[640px] sm:w-full overflow-hidden rounded-[24px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.07)] ring-1 ring-[#F0EBE3]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
              Weekly Plan
            </p>
            <h3 className="mt-0.5 text-[18px] font-bold tracking-tight text-[#1A1A1A]">
              {isCurrentWeek ? "이번 주 운동 계획" : `${format(weekStart, "M월 d일")} 주차`}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {/* 뷰 모드 세그먼트 토글 */}
            <div className="flex items-center bg-[#F5F3F0] rounded-full p-0.5">
              {[
                { label: "월간", mode: "monthly" as const },
                { label: "이번 주", mode: "weekly" as const },
              ].map(({ label, mode }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setViewMode(mode); setIsPanelOpen(false); }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-200 ${
                    viewMode === mode
                      ? "bg-white text-[#1A1A1A] shadow-sm"
                      : "text-[#9CA3AF] hover:text-[#6B7280]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {viewMode === "weekly" && completedDaysCount > 0 && (
              <span className="rounded-full bg-[#FFF0E5] px-2.5 py-0.5 text-[11px] font-bold text-[#D96B2B]">
                🔥 {completedDaysCount}일 완료
              </span>
            )}
          </div>
        </div>

        {/* 주간 뷰 */}
        {viewMode === "weekly" && (
          <>
            <div
              ref={stripRef}
              className="flex justify-between gap-1 px-4 pb-5 sm:px-5 sm:gap-2"
            >
              {weekDays.map((day, index) => {
                const isSelected = selectedDay === index && isPanelOpen;
                const today = isToday(day);
                const items = plan[index] ?? [];
                const hasItems = items.length > 0;
                const hasCompleted = Array.from(completedKeys).some((key) =>
                  key.startsWith(`${index}:`),
                );
                const isSat = index === 5;
                const isSun = index === 6;

                return (
                  <button
                    key={format(day, "yyyy-MM-dd")}
                    ref={today ? todayRef : undefined}
                    type="button"
                    onClick={() => openPanel(index)}
                    className={`relative flex flex-1 flex-col items-center gap-1.5 rounded-[18px] py-3 transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? "bg-[#1A1A1A] shadow-lg shadow-black/20"
                        : today
                          ? "bg-[#FFF4EC] ring-1.5 ring-[#D96B2B]/40"
                          : "bg-[#F5F3F0] hover:bg-[#EDE9E4]"
                    }`}
                    aria-label={`${DAY_LABELS[index]}요일 ${format(day, "d")}일`}
                  >
                    <span className={`text-[11px] font-bold ${
                      isSelected ? "text-white/70" : isSun ? "text-[#EF4444]" : isSat ? "text-[#3B82F6]" : "text-[#9CA3AF]"
                    }`}>{DAY_LABELS[index]}</span>
                    <span className={`text-[17px] font-extrabold leading-none ${
                      isSelected ? "text-white" : today ? "text-[#D96B2B]" : "text-[#1A1A1A]"
                    }`}>{format(day, "d")}</span>
                    <div className="flex items-center justify-center h-[8px]">
                      {hasCompleted ? (
                        <span className="text-[12px] leading-none translate-y-[-1px]">🔥</span>
                      ) : hasItems ? (
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/40" : "bg-[#D1C9BE]"}`} />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 이번 주 통계 요약 (푸터) */}
            <div className="border-t border-[#F0EBE3] bg-[#FCFCFA] px-5 py-3.5 flex items-center justify-between text-[13px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D1C9BE]"></span>
                계획된 운동 <span className="text-[#1A1A1A] font-bold">{totalPlannedCount}</span>개
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D96B2B]"></span>
                완료한 운동 <span className="text-[#1A1A1A] font-bold">{totalCompletedCount}</span>개
              </div>
            </div>
          </>
        )}

        {/* 월간 뷰 */}
        {viewMode === "monthly" && (
          <div className="px-4 pb-5">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
                <div key={d} className={`text-center text-[11px] font-bold py-1 ${
                  d === "일" ? "text-[#EF4444]" : d === "토" ? "text-[#3B82F6]" : "text-[#9CA3AF]"
                }`}>{d}</div>
              ))}
            </div>
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {/* 공백 채우기 */}
              {Array.from({ length: monthStartOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {monthDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const hasCompleted = completedDates.has(dateStr);
                const today = isToday(day);
                const isSun = getDay(day) === 0;
                const isSat = getDay(day) === 6;
                const isFuture = day > new Date();
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => !isFuture && openMonthDay(day)}
                    disabled={isFuture}
                    className={`flex flex-col items-center justify-center rounded-[12px] py-2 transition-colors active:scale-95 ${
                      today
                        ? "bg-[#FFF4EC] ring-1 ring-[#D96B2B]/40"
                        : isFuture
                          ? "bg-[#F5F3F0] opacity-40 cursor-default"
                          : "bg-[#F5F3F0] hover:bg-[#EDE9E4] cursor-pointer"
                    }`}
                  >
                    <span className={`text-[12px] font-bold ${
                      today ? "text-[#D96B2B]" : isSun ? "text-[#EF4444]" : isSat ? "text-[#3B82F6]" : "text-[#1A1A1A]"
                    }`}>
                      {format(day, "d")}
                    </span>
                    <span className="h-[14px] flex items-center justify-center">
                      {hasCompleted && <span className="text-[10px] leading-none">🔥</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* 월간 통계 */}
            <div className="border-t border-[#F0EBE3] mt-4 pt-3.5 flex items-center justify-between text-[13px] font-medium text-[#6B7280]">
              <div className="flex items-center gap-2">
                <span className="text-[14px]">🔥</span>
                이 달 운동 <span className="text-[#1A1A1A] font-bold">{completedDates.size}</span>일
              </div>
              <div className="text-[11px] text-[#9CA3AF]">{format(new Date(), "yyyy년 M월")}</div>
            </div>
          </div>
        )}
      </section>

      {/* ─── 바텀 시트 패널 ─── */}
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          isPanelOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closePanel}
      />

      {/* 슬라이드업 패널 */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-full sm:max-w-[640px] rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
          isPanelOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
        </div>

        {/* 패널 헤더 */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            {selectedDate && (
              <>
                <p className="text-[12px] font-bold text-[#D96B2B]">
                  {selectedDay !== null && DAY_LABELS[selectedDay]}요일
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

        {/* 구분선 */}
        <div className="mx-5 h-px bg-[#F3F4F6]" />

        {/* 운동 종목 영역 - 과거 날짜이면 기록보관소 링크, 현재/미래면 계획 UI */}
        {isPastDay ? (
          /* 과거 날짜: 기록보관소 링크 */
          <div className="px-5 pt-4 pb-6">
            <div className="flex flex-col gap-4 mb-6">
              {/* 계획했던 운동 */}
              <div>
                <p className="mb-2.5 text-[12px] font-semibold text-[#9CA3AF]">당시 계획했던 운동</p>
                {selectedItems.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map((item) => (
                      <span key={item} className="flex items-center gap-1.5 rounded-full bg-[#F5F3F0] px-3 py-1.5 text-[13px] font-semibold text-[#4B5563] ring-1 ring-[#D1C9BE]/30">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#D1C9BE]">계획된 운동이 없었습니다</p>
                )}
              </div>

              {/* 실제 기록한 운동 */}
              <div>
                <p className="mb-2.5 text-[12px] font-semibold text-[#9CA3AF]">실제 기록한 운동</p>
                {completedCatsForSelected.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {completedCatsForSelected.map((cat) => (
                      <span key={cat} className="flex items-center gap-1.5 rounded-full bg-[#FFF4EC] px-3 py-1.5 text-[13px] font-semibold text-[#D96B2B] ring-1 ring-[#D96B2B]/20">
                        <span className="text-[11px]">🔥</span>{cat}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#D1C9BE]">기록된 운동이 없습니다</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                closePanel();
                const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
                // 홈 탭의 기록 보관소 섹션으로 스크롤 이동
                const element = document.getElementById("record-archive");
                if (element) {
                   element.scrollIntoView({ behavior: 'smooth' });
                   // 쿼리 파라미터 업데이트 (필요 시 아카이브 컴포넌트에서 감지 가능하도록)
                   const newUrl = `${window.location.pathname}?date=${dateStr}#record-archive`;
                   window.history.pushState({}, '', newUrl);
                } else {
                   // 모바일 전용 페이지 등에서 fallback
                   router.push(`/${nickName}?date=${dateStr}#record-archive`);
                }
              }}
              className="flex w-full items-center justify-between rounded-[16px] bg-[#1A1A1A] px-4 py-3.5 text-left active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">나의 기록 보관소 보기</p>
                  <p className="text-[11px] text-white/40">
                    {selectedDate ? format(selectedDate, "M월 d일") : ""} 기록 확인
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#1A1A1A]">
                보러가기
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4 pb-3">
              <p className="mb-3 text-[12px] font-semibold text-[#9CA3AF]">
                {selectedItems.length > 0 ? "오늘 할 운동" : "운동을 추가해보세요"}
              </p>

              <div className="flex flex-wrap gap-2">
                {/* 나의 관심 종목 – 안정된 순서로 렌더링, 선택 여부는 색으로만 표현 */}
                {categories.map((category) => {
                  const isSelected = selectedItems.includes(category);
                  const isCompleted =
                    selectedDay !== null &&
                    completedKeys.has(`${selectedDay}:${category}`);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        if (selectedDay === null) return;
                        if (isSelected) {
                          // 선택 중이면 클릭 시 바로 작성 페이지로
                          handleWrite(selectedDay, category);
                        } else {
                          toggleCategory(selectedDay, category);
                        }
                      }}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 ${
                        isCompleted
                          ? "bg-[#D96B2B] text-white shadow-md shadow-[#D96B2B]/30"
                          : isSelected
                            ? "bg-[#1A1A1A] text-white"
                            : "border border-dashed border-[#D1C9BE] bg-white text-[#9CA3AF] hover:border-[#D96B2B] hover:text-[#D96B2B]"
                      }`}
                    >
                      {isCompleted && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                      {!isCompleted && !isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15h7.5" />
                        </svg>
                      )}
                      <span>{category}</span>
                    </button>
                  );
                })}

                {/* 다른 종목 + 추가 버튼 */}
                <button
                  type="button"
                  onClick={() => setShowExtraPicker((v) => !v)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-[#D1C9BE] bg-white px-3 py-2 text-[13px] font-semibold text-[#9CA3AF] transition-all hover:border-[#D96B2B] hover:text-[#D96B2B] active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {showExtraPicker ? "닫기" : "다른 종목"}
                </button>
              </div>

              {/* 다른 종목 픽커 팝다운 */}
              {showExtraPicker && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(ALL_CATEGORIES as readonly Category[]).filter(
                    (cat) => !categories.includes(cat)
                  ).map((cat) => (
                    <button
                      key={`extra-${cat}`}
                      type="button"
                      onClick={() => {
                        if (selectedDay !== null) toggleCategory(selectedDay, cat);
                        setShowExtraPicker(false);
                      }}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
                        selectedItems.includes(cat)
                          ? "bg-[#1A1A1A] text-white"
                          : "bg-[#F5F3F0] text-[#4B5563] hover:bg-[#EDE9E4]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 바로 작성 CTA */}
            {selectedItems.length > 0 && (
              <>
                <div className="mx-5 mt-2 h-px bg-[#F3F4F6]" />
                <div className="px-5 pt-3 pb-5">
                  <p className="mb-2.5 text-[12px] font-semibold text-[#9CA3AF]">
                    어떤 운동부터 기록할까요?
                  </p>
                  <div className="flex flex-col gap-2">
                    {selectedItems.map((item) => {
                      const count =
                        categoryCounts.find((c) => c.category === item)?.count ?? 0;
                      const isCompleted =
                        selectedDay !== null &&
                        completedKeys.has(`${selectedDay}:${item}`);
                      return (
                        <button
                          key={`write-${item}`}
                          type="button"
                          onClick={() => {
                            if (selectedDay !== null) handleWrite(selectedDay, item);
                          }}
                          className={`flex w-full items-center justify-between rounded-[16px] px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                            isCompleted
                              ? "bg-[#FFF4EC] ring-1 ring-[#F6C89A]"
                              : "bg-[#1A1A1A]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                isCompleted ? "bg-[#D96B2B]" : "bg-white/10"
                              }`}
                            >
                              {isCompleted ? (
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
                                    d="M4.5 12.75l6 6 9-13.5"
                                  />
                                </svg>
                              ) : (
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
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                                  />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p
                                className={`text-[14px] font-bold ${isCompleted ? "text-[#92400E]" : "text-white"}`}
                              >
                                {item}
                              </p>
                              <p
                                className={`text-[11px] ${isCompleted ? "text-[#D97706]" : "text-white/40"}`}
                              >
                                {isCompleted
                                  ? "오늘 완료!"
                                  : `총 ${count}회 기록`}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                              isCompleted
                                ? "bg-[#D96B2B] text-white"
                                : "bg-white text-[#1A1A1A]"
                            }`}
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
        )}

        {/* 홈 인디케이터 여백 */}
        <div className="h-safe-inset-bottom h-6" />
      </div>
    </>
  );
}
