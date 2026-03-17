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
} from "date-fns";
import { useRouter } from "next/navigation";
import { useDraftPostStore } from "@/store/CreatePostStore";
import type { Category } from "@/types/Categories";
import type { CategoryCount } from "@/types/Post";
import type { PostsData } from "@/types/responses";

type HomeWeeklyPlannerProps = {
  userId: string;
  categories: Category[];
  categoryCounts: CategoryCount[];
};

type WeeklyPlan = Record<number, Category[]>;

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const PAGE_SIZE = 30;

function getStorageKey(userId: string) {
  return `home-weekly-plan:${userId}`;
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
  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();

  const [plan, setPlan] = useState<WeeklyPlan>(createEmptyPlan);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  const weekStart = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    [],
  );

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
      const saved = window.localStorage.getItem(getStorageKey(userId));
      if (!saved) return;
      const parsed = JSON.parse(saved) as WeeklyPlan;
      setPlan({ ...createEmptyPlan(), ...parsed });
    } catch (error) {
      console.error("Failed to load weekly plan", error);
    }
  }, [userId]);

  useEffect(() => {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(plan));
  }, [plan, userId]);

  useEffect(() => {
    async function fetchWeeklyPosts() {
      try {
        const nextCompleted = new Set<string>();
        let page = 0;

        while (true) {
          const response = await fetch(
            `/api/members/getPosts?pageParam=${page}&size=${PAGE_SIZE}&id=${userId}&sort=DESC`,
            { method: "GET", headers: { "Content-Type": "application/json" } },
          );

          if (!response.ok) throw new Error("Failed to fetch weekly posts");

          const json = await response.json();
          const data = json.data as PostsData;

          if (!data?.content?.length) break;

          let reachedBeforeWeek = false;
          for (const post of data.content) {
            const postDate = parseISO(post.createdAt);
            if (isBefore(postDate, weekStart)) {
              reachedBeforeWeek = true;
              break;
            }

            const dayIndex = weekDays.findIndex((day) =>
              isSameDay(day, postDate),
            );
            if (dayIndex >= 0) {
              nextCompleted.add(`${dayIndex}:${post.category}`);
            }
          }

          if (reachedBeforeWeek || data.last) break;
          page += 1;
        }

        setCompletedKeys(nextCompleted);
      } catch (error) {
        console.error("Failed to fetch weekly planner completion", error);
      }
    }

    if (userId) {
      fetchWeeklyPosts();
    }
  }, [userId, weekDays, weekStart]);

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

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedDay(null), 300);
  };

  const selectedItems = selectedDay !== null ? (plan[selectedDay] ?? []) : [];
  const selectedDate = selectedDay !== null ? weekDays[selectedDay] : null;

  // 이번 주 완료된 날짜 수
  const completedDaysCount = weekDays.filter((_, i) =>
    (plan[i] ?? []).some((cat) => completedKeys.has(`${i}:${cat}`)),
  ).length;

  return (
    <>
      {/* ─── 위클리 캘린더 섹션 ─── */}
      <section className="mx-4 sm:mx-auto sm:max-w-[640px] sm:w-full overflow-hidden rounded-[24px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.07)] ring-1 ring-[#F0EBE3]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
              Weekly Plan
            </p>
            <h3 className="mt-0.5 text-[18px] font-bold tracking-tight text-[#1A1A1A]">
              이번 주 운동 계획
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-semibold text-[#9CA3AF]">
              {format(weekStart, "M월 d일")} –{" "}
              {format(addDays(weekStart, 6), "d일")}
            </span>
            {completedDaysCount > 0 && (
              <span className="rounded-full bg-[#FFF0E5] px-2.5 py-0.5 text-[11px] font-bold text-[#D96B2B]">
                🔥 {completedDaysCount}일 완료
              </span>
            )}
          </div>
        </div>

        {/* 날짜 스트립 */}
        <div
          ref={stripRef}
          className="flex gap-2 overflow-x-auto px-4 pb-5 sm:overflow-x-visible sm:justify-center sm:flex-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {weekDays.map((day, index) => {
            const isSelected = selectedDay === index && isPanelOpen;
            const today = isToday(day);
            const items = plan[index] ?? [];
            const hasItems = items.length > 0;
            const hasCompleted = items.some((cat) =>
              completedKeys.has(`${index}:${cat}`),
            );
            const isSat = index === 5;
            const isSun = index === 6;

            return (
              <button
                key={format(day, "yyyy-MM-dd")}
                ref={today ? todayRef : undefined}
                type="button"
                onClick={() => openPanel(index)}
                className={`relative flex flex-none flex-col items-center gap-1.5 rounded-[18px] px-3 py-3 transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "bg-[#1A1A1A] shadow-lg shadow-black/20"
                    : today
                      ? "bg-[#FFF4EC] ring-1.5 ring-[#D96B2B]/40"
                      : "bg-[#F5F3F0] hover:bg-[#EDE9E4]"
                }`}
                aria-label={`${DAY_LABELS[index]}요일 ${format(day, "d")}일`}
              >
                {/* 요일 */}
                <span
                  className={`text-[11px] font-bold ${
                    isSelected
                      ? "text-white/70"
                      : isSun
                        ? "text-[#EF4444]"
                        : isSat
                          ? "text-[#3B82F6]"
                          : "text-[#9CA3AF]"
                  }`}
                >
                  {DAY_LABELS[index]}
                </span>

                {/* 날짜 숫자 */}
                <span
                  className={`text-[17px] font-extrabold leading-none ${
                    isSelected
                      ? "text-white"
                      : today
                        ? "text-[#D96B2B]"
                        : "text-[#1A1A1A]"
                  }`}
                >
                  {format(day, "d")}
                </span>

                {/* 상태 닷 */}
                <div className="flex items-center justify-center h-[8px]">
                  {hasCompleted ? (
                    <span className="h-2 w-2 rounded-full bg-[#D96B2B]" />
                  ) : hasItems ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/40" : "bg-[#D1C9BE]"}`}
                    />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
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

        {/* 운동 종목 영역 */}
        <div className="px-5 pt-4 pb-3">
          <p className="mb-3 text-[12px] font-semibold text-[#9CA3AF]">
            {selectedItems.length > 0
              ? "오늘 할 운동"
              : "운동을 추가해보세요"}
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => {
              const isCompleted =
                selectedDay !== null &&
                completedKeys.has(`${selectedDay}:${item}`);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (selectedDay !== null) handleWrite(selectedDay, item);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95 ${
                    isCompleted
                      ? "bg-[#D96B2B] text-white shadow-md shadow-[#D96B2B]/30"
                      : "bg-[#F5F3F0] text-[#1A1A1A] ring-1 ring-[#E5DDD2] hover:bg-[#EDE9E4]"
                  }`}
                >
                  {isCompleted && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                  <span>{item}</span>
                  {!isCompleted && (
                    <span className="text-[11px] text-[#9CA3AF]">쓰기</span>
                  )}
                </button>
              );
            })}

            {/* 카테고리 추가 칩 */}
            {categories.map((category) => {
              if (selectedItems.includes(category)) return null;
              return (
                <button
                  key={`add-${category}`}
                  type="button"
                  onClick={() => {
                    if (selectedDay !== null)
                      toggleCategory(selectedDay, category);
                  }}
                  className="flex items-center gap-1 rounded-full border border-dashed border-[#D1C9BE] bg-white px-4 py-2 text-[13px] font-semibold text-[#9CA3AF] transition-all hover:border-[#D96B2B] hover:text-[#D96B2B] active:scale-95"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  {category}
                </button>
              );
            })}
          </div>
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

        {/* 종목 없을 때 안내 */}
        {selectedItems.length === 0 && (
          <div className="px-5 pb-8 pt-1 text-center">
            <p className="text-[13px] text-[#9CA3AF]">
              위에서 종목을 탭해서 이날 계획에 추가하세요
            </p>
          </div>
        )}

        {/* 홈 인디케이터 여백 */}
        <div className="h-safe-inset-bottom h-6" />
      </div>
    </>
  );
}
