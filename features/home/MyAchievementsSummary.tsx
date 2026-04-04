"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { inter } from "@/lib/fonts";
import {
  localPlannerPlanRepository,
  type PlannerPlanMap,
} from "@/features/home/plannerPlanRepository";
import type { PostsData } from "@/types/responses";

export default function MyAchievementsSummary({
  userId,
  totalCount = 0,
  streakWeeks = 0,
  thisWeekCount = 0,
}: {
  userId: string;
  totalCount?: number;
  streakWeeks?: number;
  thisWeekCount?: number;
}) {
  const [, setCompletedGoalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    // 개인 점수에 목표 달성한 것 반영하기 위해서.. 백엔드 전환 시 반영 필요
    async function fetchCompletedGoalCount(plans: PlannerPlanMap) {
      const plannedEntries = Object.values(plans).filter(
        (entry) => entry.categories.length > 0,
      );

      if (plannedEntries.length === 0) {
        if (isMounted) {
          setCompletedGoalCount(0);
        }
        return;
      }

      const plannedDateKeys = new Set(
        plannedEntries.map((entry) => entry.date),
      );
      const earliestPlannedDate = plannedEntries.reduce(
        (earliest, entry) => (entry.date < earliest ? entry.date : earliest),
        plannedEntries[0].date,
      );
      const completedCategoriesByDate = new Map<string, Set<string>>();
      let page = 0;

      while (true) {
        const response = await fetch(
          `/api/members/getPosts?pageParam=${page}&size=30&id=${userId}&sort=DESC`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const json = await response.json();
        const data = json.data as PostsData;
        const posts = data?.content ?? [];

        if (posts.length === 0) {
          break;
        }

        let reachedBeforePlannedRange = false;

        for (const post of posts) {
          const postDateKey = format(parseISO(post.createdAt), "yyyy-MM-dd");

          if (postDateKey < earliestPlannedDate) {
            reachedBeforePlannedRange = true;
            break;
          }

          if (!plannedDateKeys.has(postDateKey)) {
            continue;
          }

          const categoriesForDate =
            completedCategoriesByDate.get(postDateKey) ?? new Set<string>();
          categoriesForDate.add(post.category);
          completedCategoriesByDate.set(postDateKey, categoriesForDate);
        }

        if (reachedBeforePlannedRange || data.last) {
          break;
        }

        page += 1;
      }

      const nextCompletedGoalCount = plannedEntries.reduce((count, entry) => {
        const completedCategories =
          completedCategoriesByDate.get(entry.date) ?? new Set<string>();

        return (
          count +
          entry.categories.filter((category) =>
            completedCategories.has(category),
          ).length
        );
      }, 0);

      if (isMounted) {
        setCompletedGoalCount(nextCompletedGoalCount);
      }
    }

    async function loadCompletedGoalCount() {
      try {
        const plans = await localPlannerPlanRepository.listPlans(userId);
        await fetchCompletedGoalCount(plans);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        console.error("Failed to load completed goal count", error);
        if (isMounted) {
          setCompletedGoalCount(0);
        }
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== `home-planner-plans:${userId}`) return;
      loadCompletedGoalCount();
    };

    const handlePlansUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: string }>;
      if (customEvent.detail?.userId !== userId) return;
      loadCompletedGoalCount();
    };

    loadCompletedGoalCount();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("home-planner-plans-updated", handlePlansUpdated);

    return () => {
      isMounted = false;
      controller.abort();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "home-planner-plans-updated",
        handlePlansUpdated,
      );
    };
  }, [userId]);

  // 열정 온도 계산 로직, 현재 게시글당 0.4, 계획 세우고 하면 추가로 0.1, 주 3회 완성하면 1.5
  // 계획 데이터 백엔드 이관 전까지는 제외하고 사용
  const passionTemp = useMemo(() => {
    const calculated = 36.5 + 0.4 * totalCount + 1.5 * streakWeeks;
    // const calculated = 36.5 + 0.4 * totalCount + 0.1 * completedGoalCount + 1.5 * streakWeeks;
    return Math.max(36.5, Math.min(100, Number(calculated.toFixed(1))));
  }, [streakWeeks, totalCount]);

  // 구간을 6단계로 세밀하게 나누고 긍정적인 문구 반영
  const tempStatus = useMemo(() => {
    if (passionTemp >= 90)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "한계를 넘는 열정!",
        icon: "🌋",
        gradient: "from-purple-500 via-red-500 to-yellow-500",
      };
    if (passionTemp >= 80)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "멈추지 않는 열정 엔진",
        icon: "🔥",
        gradient: "from-rose-500 to-purple-500",
      };
    if (passionTemp >= 65)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "궤도에 오른 뜨거움",
        icon: "⚡",
        gradient: "from-red-400 to-rose-500",
      };
    if (passionTemp >= 50)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "흔들림 없는 꾸준함",
        icon: "🏃‍♂️",
        gradient: "from-orange-400 to-red-400",
      };
    if (passionTemp >= 40)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "열기가 오르는 중",
        icon: "✨",
        gradient: "from-yellow-300 to-orange-400",
      };
    if (passionTemp > 36.5)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "운동 세포 깨우기",
        icon: "🌱",
        gradient: "from-[#CDBA96] to-yellow-400",
      };
    // 36.5도 (기록 0회)
    return {
      color: "text-[#D96B2B]",
      bg: "bg-[#FFF4EC]",
      label: "운동기록 첫걸음",
      icon: "🌱",
      gradient: "from-gray-300 to-gray-400",
    };
  }, [passionTemp]);

  const isWeekGoalCompleted = thisWeekCount < 3;

  return (
    <section className="mx-5 sm:mx-auto sm:w-full sm:max-w-[640px]">
      <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-theme">
                Passion Temp
              </p>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <h3
                className={`text-[24px] sm:text-[28px] font-black tracking-tight text-gray-900 leading-none ${inter.className}`}
              >
                {passionTemp}
                <span className="ml-[2px] text-[16px] font-bold">℃</span>
              </h3>
              <span
                className={`ml-1 flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-[11px] font-bold ${tempStatus.bg} ${tempStatus.color}`}
              >
                <span>{tempStatus.icon}</span>
                <span>{tempStatus.label}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-[#F5F3F0] px-3 py-1 text-[12px] font-semibold text-[#4B5563]">
              <span className="text-[10px] uppercase text-[#9CA3AF]">Total</span>
              <span className={`font-bold text-[#1A1A1A] ${inter.className}`}>
                {totalCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#FFF4EC] px-3 py-1 text-[12px] font-semibold text-[#D96B2B]">
              <span className="text-[10px] uppercase text-[#F6C89A]">Streak</span>
              <span className={`font-bold ${inter.className}`}>
                {streakWeeks}주
              </span>
            </div>
          </div>
        </div>

        <div className="mb-3 mt-5">
          <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-100 shadow-inner">
            {passionTemp > 37.6 && (
              <div
                className="absolute top-0 bottom-0 z-10 w-0.5 bg-gray-300 shadow-sm"
                style={{ left: `36.5%` }}
              />
            )}
            <div
              className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${tempStatus.gradient}`}
              style={{ width: `${Math.max(2, passionTemp)}%` }}
            />
          </div>

          <div className="relative mt-2 flex justify-between text-[10px] font-medium text-gray-400 sm:text-xs">
            <span>0°C</span>
            <span className="absolute left-[36.5%] -translate-x-1/2 font-bold text-theme">
              36.5°C
            </span>
            <span>100°C</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[12px] font-medium text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            이번 주 운동 횟수:{" "}
            <span
              className={`font-bold ${inter.className} ${thisWeekCount >= 3 ? "text-theme" : "text-gray-600"}`}
            >
              {thisWeekCount}
            </span>{" "}
            / 3회
          </p>
          <p className="text-[11px] sm:text-[12px]">
            {isWeekGoalCompleted
              ? "주 3회를 채워 온기를 계속 유지해보세요!"
              : "🔥 완벽합니다! 열정이 꾸준히 오르고 있어요!"}
          </p>
        </div>
      </div>
    </section>
  );
}
