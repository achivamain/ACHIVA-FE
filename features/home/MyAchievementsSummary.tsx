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
  // 열정 온도 계산 로직 (기본 36.5도 보장, 상승폭 유지, 난이도 조절)
  const passionTemp = useMemo(() => {
    let calculated = 36.5 + (totalCount * 0.2) + (streakWeeks * 0.8);
    
    // 냉각 패널티: 주 3회 미만일 때 차감 (하지만 최소 36.5도는 유지하여 긍정적인 피드백 지속)
    if (thisWeekCount < 3) {
      const penalty = (3 - thisWeekCount) * 1.5;
      calculated -= penalty;
    }
    
    return Math.max(36.5, Math.min(99.9, Number(calculated.toFixed(1))));
  }, [totalCount, streakWeeks, thisWeekCount]);

  // 구간을 6단계로 세밀하게 나누고 긍정적인 문구 반영
  const tempStatus = useMemo(() => {
    if (passionTemp >= 90) return { 
      color: "text-[#D96B2B]", 
      bg: "bg-[#FFF4EC]", 
      label: "한계를 넘는 시너지!", 
      icon: "🌋", 
      barColor: "bg-[#D96B2B]"
    };
    if (passionTemp >= 80) return { 
      color: "text-[#D96B2B]", 
      bg: "bg-[#FFF4EC]", 
      label: "멈추지 않는 열정 엔진", 
      icon: "🔥", 
      barColor: "bg-gradient-to-r from-[#F6C89A] to-[#D96B2B]"
    };
    if (passionTemp >= 65) return { 
      color: "text-[#1A1A1A]", 
      bg: "bg-[#F5F3F0]", 
      label: "궤도에 오른 뜨거움", 
      icon: "⚡", 
      barColor: "bg-[#1A1A1A]"
    };
    if (passionTemp >= 50) return { 
      color: "text-[#1A1A1A]", 
      bg: "bg-[#F5F3F0]", 
      label: "흔들림 없는 꾸준함", 
      icon: "🏃‍♂️", 
      barColor: "bg-gradient-to-r from-[#D96B2B]/40 to-[#1A1A1A]"
    };
    if (passionTemp >= 40) return { 
      color: "text-[#D96B2B]", 
      bg: "bg-[#FFF4EC]", 
      label: "열기가 오르는 중", 
      icon: "✨", 
      barColor: "bg-[#F6C89A]"
    };
    // 36.5도 ~ 40도 미만 (기록 1회 이상)
    if (totalCount > 0) return { 
      color: "text-[#D96B2B]", 
      bg: "bg-[#FFF4EC]", 
      label: "운동 세포 깨우기", 
      icon: "🌱", 
      barColor: "bg-[#FAD9BB]"
    };
    // 36.5도 (기록 0회)
    return { 
      color: "text-[#D96B2B]", 
      bg: "bg-[#FFF4EC]", 
      label: "운동기록 첫걸음", 
      icon: "🌱", 
      barColor: "bg-[#FDE2C3]"
    };
  }, [passionTemp, totalCount]);

  const isCoolingDown = thisWeekCount < 3;

  return (
    <section className="mx-5 sm:mx-auto sm:max-w-[640px] sm:w-full overflow-hidden rounded-[24px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.07)] ring-1 ring-[#F0EBE3] px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        {/* 왼쪽: 온도 정보 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
              Passion Temp
            </p>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <h3 className={`text-[24px] sm:text-[28px] font-black tracking-tight text-[#1A1A1A] leading-none ${inter.className}`}>
              {passionTemp}
              <span className="text-[16px] ml-[2px] font-bold">℃</span>
            </h3>
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-[8px] ${tempStatus.bg} ${tempStatus.color} font-bold text-[11px] ml-1`}>
              <span>{tempStatus.icon}</span>
              <span>{tempStatus.label}</span>
            </span>
          </div>
        </div>
        
        {/* 오른쪽: 통계 칩들 (플래너 스타일과 유사하게) */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 rounded-full bg-[#F5F3F0] px-3 py-1 text-[12px] font-semibold text-[#4B5563]">
            <span className="text-[#9CA3AF] text-[10px] uppercase">Total</span>
            <span className={`text-[#1A1A1A] font-bold ${inter.className}`}>{totalCount}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#FFF4EC] px-3 py-1 text-[12px] font-semibold text-[#D96B2B]">
            <span className="text-[#F6C89A] text-[10px] uppercase">Streak</span>
            <span className={`font-bold ${inter.className}`}>{streakWeeks}주</span>
          </div>
        </div>
      </div>

      {/* 온도 바 (플래너 톤앤매너로 심플하게) */}
      <div className="relative mb-3 mt-5">
        <div className="relative h-2.5 w-full rounded-full bg-[#F5F3F0] overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out rounded-full ${tempStatus.barColor}`}
            style={{ width: `${(passionTemp / 99.9) * 100}%` }}
          />
        </div>
      </div>
      
      {/* 하단 캡션 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[12px] text-[#9CA3AF] font-medium gap-1">
        <p>이번 주 운동 횟수: <span className={`font-bold ${inter.className} ${thisWeekCount >= 3 ? "text-[#D96B2B]" : "text-[#4B5563]"}`}>{thisWeekCount}</span> / 3회</p>
        <p className="text-[11px] sm:text-[12px]">
          {isCoolingDown 
            ? "주 3회를 채워 온기를 계속 유지해보세요!" 
            : "🔥 완벽합니다! 열정이 꾸준히 오르고 있어요!"}
        </p>
      </div>
    </section>
  );
}
