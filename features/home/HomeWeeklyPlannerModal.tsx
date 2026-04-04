"use client";

import { motion } from "motion/react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { Category } from "@/types/Categories";

type DayStatus = "past" | "today" | "future";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getDayIndex(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function TagList({
  title,
  emptyText,
  tone,
  values,
}: {
  title: string;
  emptyText: string;
  tone: "neutral" | "completed";
  values: string[];
}) {
  return (
    <div>
      <p className="mb-2.5 text-[12px] font-semibold text-[#9CA3AF]">{title}</p>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] font-semibold",
                tone === "completed"
                  ? "bg-[#FFF4EC] text-[#D96B2B] ring-1 ring-[#D96B2B]/20"
                  : "bg-[#F5F3F0] text-[#4B5563] ring-1 ring-[#D1C9BE]/30",
              )}
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-[#C8C0B4]">{emptyText}</p>
      )}
    </div>
  );
}

type HomeWeeklyPlannerModalProps = {
  selectedDate: Date | null;
  dayStatus: DayStatus | null;
  plannedCategories: Category[];
  completedCategories: string[];
  allCategories: Category[];
  onClose: () => void;
  onToggleCategory: (category: Category) => void;
  onWriteCategory: (category: Category) => void;
  onMoveToArchive: () => void;
};

export default function HomeWeeklyPlannerModal({
  selectedDate,
  dayStatus,
  plannedCategories,
  completedCategories,
  allCategories,
  onClose,
  onToggleCategory,
  onWriteCategory,
  onMoveToArchive,
}: HomeWeeklyPlannerModalProps) {
  if (!selectedDate) {
    return null;
  }

  const activeWriteCategory =
    dayStatus === "today" ? plannedCategories[plannedCategories.length - 1] : null;

  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        className="fixed inset-0 z-40 bg-black/35 transition-opacity"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out sm:left-1/2 sm:right-auto sm:w-full sm:max-w-[640px] sm:-translate-x-1/2"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div>
            {selectedDate && (
              <>
                <p className="text-[12px] font-bold text-[#D96B2B]">
                  {DAY_LABELS[getDayIndex(selectedDate)]}요일
                </p>
                <h4 className="text-[20px] font-extrabold text-[#4A433D]">
                  {format(selectedDate, "M월 d일", { locale: ko })}
                </h4>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
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

        <div className="mx-5 h-px bg-[#F3F4F6]" />

        {selectedDate && dayStatus === "past" ? (
          <div className="px-5 pt-4 pb-6">
            <div className="mb-6 flex flex-col gap-4">
              <TagList
                title="당시 계획했던 운동"
                emptyText="계획된 운동이 없었습니다"
                tone="neutral"
                values={plannedCategories}
              />
              <TagList
                title="실제 기록한 운동"
                emptyText="기록된 운동이 없습니다"
                tone="completed"
                values={completedCategories}
              />
            </div>

            <button
              type="button"
              onClick={onMoveToArchive}
              className="flex w-full items-center justify-between rounded-[16px] bg-[#4A433D] px-4 py-3.5 text-left transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
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
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">
                    나의 기록 보관소 보기
                  </p>
                  <p className="text-[11px] text-white/40">
                    {format(selectedDate, "M월 d일", { locale: ko })} 기록 확인
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#4A433D]">
                보러가기
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
          </div>
        ) : selectedDate && dayStatus ? (
          <div className="px-5 pt-4 pb-6">
            <p className="mb-3 text-[12px] font-semibold text-[#9CA3AF]">
              {dayStatus === "today"
                ? plannedCategories.length > 0
                  ? "오늘 할 운동"
                  : "오늘 운동을 계획해보세요"
                : plannedCategories.length > 0
                ? "예정된 운동"
                  : "운동을 계획해보세요"}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {allCategories.map((category) => {
                const isPlanned = plannedCategories.includes(category);

                return (
                  <div
                    key={category}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleCategory(category)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95",
                        isPlanned
                          ? "bg-[#4A433D] text-white"
                          : "border border-dashed border-[#D1C9BE] bg-white text-[#9CA3AF] hover:border-[#D96B2B] hover:text-[#D96B2B]",
                      )}
                    >
                      <span>{category}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {dayStatus === "today" && plannedCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-4 flex items-center justify-between rounded-[18px] bg-[#4A433D] px-4 py-3 text-white shadow-lg shadow-black/10"
              >
                <div>
                  <p className="text-[11px] text-white/45">
                    오늘 계획한 운동
                  </p>
                  <p className="mt-0.5 text-[15px] font-bold">
                    {activeWriteCategory} 기록하러 가기
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => activeWriteCategory && onWriteCategory(activeWriteCategory)}
                  className="rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#4A433D]"
                >
                  글 쓰기
                </button>
              </motion.div>
            )}
          </div>
        ) : null}

        <div className="h-6 h-safe-inset-bottom" />
      </div>
    </>
  );
}
