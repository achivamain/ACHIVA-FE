"use client";

import { useMemo } from "react";
import { inter } from "@/lib/fonts";

export default function MyAchievementsSummary({
  totalCount = 0,
  streakWeeks = 0,
  thisWeekCount = 0,
}: {
  totalCount?: number;
  streakWeeks?: number;
  thisWeekCount?: number;
}) {
  // 열정 온도 계산 로직은 기록 수와 주간 스트릭만 반영합니다.
  const passionTemp = useMemo(() => {
    const calculated = 36.5 + 0.4 * totalCount + 1.5 * streakWeeks;
    return Math.max(36.5, Math.min(100, Number(calculated.toFixed(1))));
  }, [streakWeeks, totalCount]);

  // 구간을 6단계로 세밀하게 나누고 긍정적인 문구 반영
  const tempStatus = useMemo(() => {
    if (passionTemp >= 90)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "넘치는 은혜의 불꽃!",
        icon: "🌋",
        gradient: "from-purple-500 via-red-500 to-yellow-500",
      };
    if (passionTemp >= 80)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "날마다 은혜로 충만",
        icon: "🔥",
        gradient: "from-rose-500 to-purple-500",
      };
    if (passionTemp >= 65)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "은혜 위에 은혜",
        icon: "⚡",
        gradient: "from-red-400 to-rose-500",
      };
    if (passionTemp >= 50)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "흔들림 없는 신앙",
        icon: "✝️",
        gradient: "from-orange-400 to-red-400",
      };
    if (passionTemp >= 40)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "은혜 안으로 깊이",
        icon: "✨",
        gradient: "from-yellow-300 to-orange-400",
      };
    if (passionTemp > 36.5)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "은혜의 첫걸음",
        icon: "🌱",
        gradient: "from-[#CDBA96] to-yellow-400",
      };
    // 36.5도 (기록 0회)
    return {
      color: "text-[#D96B2B]",
      bg: "bg-[#FFF4EC]",
      label: "첫 은혜를 기록해보세요",
      icon: "🌱",
      gradient: "from-orange-200 to-orange-300",
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
                Grace Temp
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
              <span className="text-[10px] text-[#9CA3AF]">누적 은혜</span>
              <span className={`font-bold text-[#1A1A1A] ${inter.className}`}>
                {totalCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#FFF4EC] px-3 py-1 text-[12px] font-semibold text-[#D96B2B]">
              <span className="text-[10px] text-[#F6C89A]">연속 은혜</span>
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
            이번 주 은혜 기록:{" "}
            <span
              className={`font-bold ${inter.className} ${thisWeekCount >= 3 ? "text-theme" : "text-gray-600"}`}
            >
              {thisWeekCount}
            </span>{" "}
            / 3회
          </p>
          <p className="text-[11px] sm:text-[12px]">
            {isWeekGoalCompleted
              ? "주 3회를 채워 은혜를 쌓아가요!"
              : "🔥 놀라운 은혜입니다! 날마다 주님과 동행 중이에요!"}
          </p>
        </div>
      </div>
    </section>
  );
}
