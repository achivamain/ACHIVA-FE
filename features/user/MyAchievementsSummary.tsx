"use client";

import { useMemo } from "react";
import { inter } from "@/lib/fonts";
import { calculateMemberTemperature } from "@/lib/ranking";

export default function MyAchievementsSummary({
  totalCount = 0,
  streakWeeks = 0,
  totalCharacterCount = 0,
  totalCheeringScore = 0,
}: {
  totalCount?: number;
  streakWeeks?: number;
  totalCharacterCount?: number;
  totalCheeringScore?: number;
}) {
  const passionTemp = useMemo(() => {
    return Math.max(
      36.5,
      Math.min(100, calculateMemberTemperature(totalCount, streakWeeks)),
    );
  }, [streakWeeks, totalCount]);

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

    return {
      color: "text-[#D96B2B]",
      bg: "bg-[#FFF4EC]",
      label: "첫 은혜를 기록해보세요",
      icon: "🌱",
      gradient: "from-[#FAE6CF] to-[#EBC18E]",
    };
  }, [passionTemp]);

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
                style={{ left: "36.5%" }}
              />
            )}
            <div
              className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${tempStatus.gradient}`}
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

        <div className="mt-5 space-y-2 rounded-[18px] border border-[#F0EBE3] bg-[#FAFAF8] px-4 py-4">
          <SummaryRow
            label="쌓아올린 글자 수"
            value={totalCharacterCount.toLocaleString()}
            unit="자"
          />
          <SummaryRow
            label="주고받은 응원들"
            value={totalCheeringScore.toLocaleString()}
            unit="점"
          />
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[13px] sm:text-[14px]">
      <span className="shrink-0 font-semibold text-[#7E7166]">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-[#E5D7C7] to-transparent" />
      <span className={`shrink-0 text-[17px] font-black text-[#4A433D] ${inter.className}`}>
        {value}
        <span className="ml-1 text-[12px] font-bold text-[#8E7F73]">{unit}</span>
      </span>
    </div>
  );
}
