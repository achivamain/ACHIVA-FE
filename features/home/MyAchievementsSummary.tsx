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
        gradient: "from-[#E9A86B] via-[#D96B2B] to-[#B94D32]",
      };
    if (passionTemp >= 80)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "날마다 은혜로 충만",
        icon: "🔥",
        gradient: "from-[#E5A16B] to-[#C45A35]",
      };
    if (passionTemp >= 65)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "은혜 위에 은혜",
        icon: "⚡",
        gradient: "from-[#E8B37A] to-[#D96B2B]",
      };
    if (passionTemp >= 50)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "흔들림 없는 신앙",
        icon: "✝️",
        gradient: "from-[#F0C48B] to-[#DE8550]",
      };
    if (passionTemp >= 40)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "은혜 안으로 깊이",
        icon: "✨",
        gradient: "from-[#F5D7A4] to-[#E8A16A]",
      };
    if (passionTemp > 36.5)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "은혜의 첫걸음",
        icon: "🌱",
        gradient: "from-[#F7DFC0] to-[#E7B77F]",
      };
    // 36.5도 (기록 0회)
      return {
        color: "text-[#D96B2B]",
        bg: "bg-[#FFF4EC]",
        label: "첫 은혜를 기록해보세요",
        icon: "🌱",
        gradient: "from-[#FAE6CF] to-[#EBC18E]",
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

        </div>

        <div className="mb-3 mt-5">
          <div className="relative h-2.5 overflow-hidden rounded-full bg-[#F3EDE5]">
            {passionTemp > 37.6 && (
              <div
                className="absolute bottom-0 top-0 z-10 w-[2px] bg-[#E6C8A6]"
                style={{ left: `36.5%` }}
              />
            )}
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${tempStatus.gradient}`}
              style={{ width: `${Math.max(2, passionTemp)}%` }}
            />
          </div>

          <div className="relative mt-2 flex justify-between text-[10px] font-medium text-[#B7A79A] sm:text-xs">
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
