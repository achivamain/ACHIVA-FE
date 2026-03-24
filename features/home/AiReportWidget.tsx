"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type AiReportData = {
  calories: string;
  weeklyScore: string;
  bodyChange: string;
  weakness: string;
  nextWeekPlan: string;
  funFact: string;
  latestFeedback?: string; // 24시간 내 게시물 있을 때만
};

const SECTIONS = [
  { key: "calories",     emoji: "🔥", label: "칼로리 소모" },
  { key: "weeklyScore",  emoji: "📊", label: "이번 주 점수" },
  { key: "bodyChange",   emoji: "💪", label: "1달 후 예측" },
  { key: "weakness",     emoji: "⚡", label: "보완할 점" },
  { key: "nextWeekPlan", emoji: "🎯", label: "추천 루틴" },
  { key: "funFact",      emoji: "✨", label: "재미있는 사실" },
] as const;

export default function AiReportWidget({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<AiReportData>({
    queryKey: ["ai-report-v2", userId],
    queryFn: async () => {
      const res = await fetch("/api/ai-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  return (
    <section className="mx-5 sm:mx-auto sm:max-w-[640px] sm:w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1A1A1A] to-[#2A2218] shadow-[0_4px_24px_rgba(0,0,0,0.18)] ring-1 ring-[#3A3A3A] text-white">
      {/* 헤더 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#D96B2B] to-[#F1935C] shadow-lg">
            <span className="text-[18px]">✨</span>
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">AI 루틴 솔루션</p>
            <h3 className="text-[17px] font-extrabold tracking-tight">한달 운동 분석 리포트</h3>
          </div>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* 콘텐츠 */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-6 pt-0">
          {/* 구분선 */}
          <div className="h-px bg-white/10 mb-5" />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-white/20 border-t-[#D96B2B]" />
              <p className="text-[13px] font-medium text-white/60 animate-pulse">AI가 운동 기록을 분석하고 있어요...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-[13px] text-red-400 mb-3">분석 중 오류가 발생했어요.</p>
              <button
                onClick={() => refetch()}
                className="text-[13px] font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : data ? (
            <div className="flex flex-col gap-3">
              {/* 방금 기록한 운동 피드백 (24시간 내 게시물 있을 때만) */}
              {data.latestFeedback && (
                <div className="rounded-[16px] bg-gradient-to-r from-[#D96B2B]/30 to-[#F1935C]/20 border border-[#D96B2B]/40 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[16px]">🆕</span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#F1935C]">방금 기록한 운동 피드백</span>
                  </div>
                  <p className="text-[13px] leading-[1.65] text-white">{data.latestFeedback}</p>
                </div>
              )}
              {/* 일반 분석 카드들 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SECTIONS.map(({ key, emoji, label }) => (
                  <div
                    key={key}
                    className="flex flex-col gap-1.5 rounded-[16px] bg-white/6 border border-white/10 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">{emoji}</span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#D96B2B]">{label}</span>
                    </div>
                    <p className="text-[13px] leading-[1.65] text-white/90">{data[key as keyof AiReportData]}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
