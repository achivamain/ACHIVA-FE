"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [completedGoalCount, setCompletedGoalCount] = useState(0);
  const activityScore = totalCount + completedGoalCount + streakWeeks;
  const debugTemp = useMemo(() => {
    const raw = searchParams.get("debugTemp");
    if (!raw) return null;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;

    return Math.max(36.5, Math.min(100, Number(parsed.toFixed(1))));
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

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
  const passionTemp = useMemo(() => {
    const calculated =
      36.5 + 0.4 * totalCount + 0.1 * completedGoalCount + 1.5 * streakWeeks;
    const baseTemp = Math.max(
      36.5,
      Math.min(100, Number(calculated.toFixed(1))),
    );
    return debugTemp ?? baseTemp;
  }, [completedGoalCount, debugTemp, streakWeeks, totalCount]);

  // 구간을 6단계로 세밀하게 나누고 긍정적인 문구 반영
  const tempStatus = useMemo(() => {
    if (passionTemp >= 90)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "한계를 넘는 시너지!",
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
        bg: "bg-[##FFF4EC]",
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
  }, [activityScore, passionTemp]);

  const isCoolingDown = thisWeekCount < 3;

  return (
    <section className="mx-5 sm:mx-auto sm:max-w-[640px] sm:w-full overflow-hidden rounded-[24px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.07)] ring-1 ring-gray-100 px-5 py-5">
      <div className="flex items-end justify-between mb-4">
        {/* 왼쪽: 온도 정보 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-theme">
              Passion Temp
            </p>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <h3
              className={`text-[24px] sm:text-[28px] font-black tracking-tight text-gray-900 leading-none ${inter.className}`}
            >
              {passionTemp}
              <span className="text-[16px] ml-[2px] font-bold">℃</span>
            </h3>
            <span
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[8px] ${tempStatus.bg} ${tempStatus.color} font-bold text-[11px] ml-1`}
            >
              <span>{tempStatus.icon}</span>
              <span>{tempStatus.label}</span>
            </span>
          </div>
        </div>

        {/* 통계 칩들  */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 rounded-full bg-[#F5F3F0] px-3 py-1 text-[12px] font-semibold text-[#4B5563]">
            <span className="text-[#9CA3AF] text-[10px] uppercase">Total</span>
            <span className={`text-[#1A1A1A] font-bold ${inter.className}`}>
              {totalCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#FFF4EC] px-3 py-1 text-[12px] font-semibold text-[#D96B2B]">
            <span className="text-[#F6C89A] text-[10px] uppercase">Streak</span>
            <span className={`font-bold ${inter.className}`}>
              {streakWeeks}주
            </span>
          </div>
        </div>
      </div>

      {/* 온도바 */}
      <div className="mt-5 mb-3">
        <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          {passionTemp > 37.6 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-300 z-10 shadow-sm"
              style={{ left: `36.5%` }}
              title="기본 체온 (36.5°C)"
            />
          )}
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${tempStatus.gradient}`}
            style={{ width: `${Math.max(2, passionTemp)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-medium mt-2 relative">
          <span>0°C</span>
          <span className="absolute left-[36.5%] -translate-x-1/2 text-theme font-bold">
            36.5°C
          </span>
          <span>100°C</span>
        </div>
      </div>

      {/* 하단 캡션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[12px] text-gray-400 font-medium gap-1">
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
          {isCoolingDown
            ? "주 3회를 채워 온기를 계속 유지해보세요!"
            : "🔥 완벽합니다! 열정이 꾸준히 오르고 있어요!"}
        </p>
      </div>
    </section>
  );
}
