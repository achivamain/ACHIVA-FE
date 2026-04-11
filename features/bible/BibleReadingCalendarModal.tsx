"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { fetchScriptureReadingCalendar } from "@/features/bible/api";
import { getScriptureMeta } from "@/features/bible/mockData";
import type { ScriptureReadingCalendarItem } from "@/features/bible/types";

type BibleReadingCalendarModalProps = {
  authorName: string;
  memberId: string;
  onClose: () => void;
};

function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function getRecordSignature(item: ScriptureReadingCalendarItem) {
  return [
    item.articleId,
    item.scriptureReading.scriptureId,
    item.scriptureReading.startChapter,
    item.scriptureReading.endChapter,
    item.scriptureReading.completedChapters,
    item.content.trim(),
  ].join("|");
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function BibleReadingCalendarModal({
  authorName,
  memberId,
  onClose,
}: BibleReadingCalendarModalProps) {
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const yearMonth = format(displayMonth, "yyyy-MM");
  const { data = [], isLoading } = useQuery({
    queryKey: ["scripture-reading-calendar", memberId, yearMonth],
    queryFn: () => fetchScriptureReadingCalendar(memberId, yearMonth),
    enabled: !!memberId,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (data.length === 0) {
      setSelectedDate(startOfMonth(displayMonth));
      return;
    }

    const sorted = [...data].sort((a, b) => {
      const readAtA = a.scriptureReading.readAt ?? a.createdAt;
      const readAtB = b.scriptureReading.readAt ?? b.createdAt;
      if (readAtA !== readAtB) {
        return readAtB.localeCompare(readAtA);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

    const firstDate = sorted[0].scriptureReading.readAt ?? sorted[0].createdAt;
    setSelectedDate(parseISO(firstDate));
  }, [data, displayMonth]);

  const recordsByDate = useMemo(() => {
    return data.reduce<Record<string, ScriptureReadingCalendarItem[]>>((acc, item) => {
      const rawDate = item.scriptureReading.readAt ?? item.createdAt;
      const key = getDateKey(parseISO(rawDate));
      const nextItems = acc[key] ?? [];
      const signature = getRecordSignature(item);

      if (nextItems.some((current) => getRecordSignature(current) === signature)) {
        return acc;
      }

      acc[key] = [...nextItems, item].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return acc;
    }, {});
  }, [data]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(endOfMonth(displayMonth), { weekStartsOn: 1 });

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  }, [displayMonth]);

  const markedDateKeys = useMemo(
    () => new Set(Object.keys(recordsByDate)),
    [recordsByDate],
  );
  const selectedDateKey = getDateKey(selectedDate);
  const selectedRecords = recordsByDate[selectedDateKey] ?? [];

  useEffect(() => {
    if (isSameMonth(selectedDate, displayMonth)) return;

    const monthKeyPrefix = format(displayMonth, "yyyy-MM");
    const firstMarkedInMonth = data.find((item) =>
      (item.scriptureReading.readAt ?? item.createdAt).startsWith(monthKeyPrefix),
    );

    setSelectedDate(
      firstMarkedInMonth
        ? parseISO(firstMarkedInMonth.scriptureReading.readAt ?? firstMarkedInMonth.createdAt)
        : startOfMonth(displayMonth),
    );
  }, [data, displayMonth, selectedDate]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-[#8A817A]">
                {authorName}님의 성경일독
              </p>
              <h3 className="mt-1 text-[20px] font-black text-[#4A433D]">
                달력 기록 보기
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D]"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="rounded-[22px] border border-gray-100 bg-[#FAFAF8] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDisplayMonth((current) => subMonths(current, 1))}
                className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D]"
              >
                이전 달
              </button>
              <p className="text-[16px] font-bold text-[#4A433D]">
                {format(displayMonth, "yyyy년 M월", { locale: ko })}
              </p>
              <button
                type="button"
                onClick={() => setDisplayMonth((current) => addMonths(current, 1))}
                className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D]"
              >
                다음 달
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["월", "화", "수", "목", "금", "토", "일"].map((label) => (
                <div
                  key={label}
                  className="pb-1 text-center text-[11px] font-semibold text-[#8A817A]"
                >
                  {label}
                </div>
              ))}
              {monthDays.map((date) => {
                const dateKey = getDateKey(date);
                const hasRecord = markedDateKeys.has(dateKey);
                const isSelected = isSameDay(date, selectedDate);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex h-[56px] flex-col items-center justify-center rounded-[16px] border text-center transition-all",
                      isSelected
                        ? "border-[#F3D5C0] bg-[#FFF4EC]"
                        : hasRecord
                          ? "border-[#F3E3D6] bg-white"
                          : "border-gray-100 bg-white",
                      !isSameMonth(date, displayMonth) && "opacity-35",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[13px] font-bold",
                        isToday(date) ? "text-[#D96B2B]" : "text-[#4A433D]",
                      )}
                    >
                      {format(date, "d")}
                    </span>
                    <span className="mt-1 flex min-h-[14px] items-center justify-center">
                      {hasRecord ? (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFF4EC] px-1.5 text-[10px] font-bold text-[#D96B2B]">
                          {recordsByDate[dateKey]?.length ?? 0}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-gray-100 bg-white p-4 shadow-sm">
            <h4 className="text-[18px] font-bold text-[#4A433D]">
              {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
            </h4>

            {isLoading ? (
              <div className="mt-4 rounded-[18px] border border-dashed border-gray-200 bg-[#FAFAF8] px-4 py-4 text-[13px] leading-6 text-[#8A817A]">
                기록을 불러오는 중입니다.
              </div>
            ) : selectedRecords.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {selectedRecords.map((record) => {
                  const scripture = getScriptureMeta(record.scriptureReading.scriptureId);
                  return (
                    <div
                      key={record.articleId}
                      className="rounded-[18px] border border-gray-100 bg-[#FAFAF8] px-4 py-3"
                    >
                      <p className="text-[14px] font-bold text-[#4A433D]">
                        {record.scriptureReading.scriptureId} {record.scriptureReading.startChapter}장 -{" "}
                        {record.scriptureReading.endChapter}장
                      </p>
                      <p className="mt-1 text-[12px] text-[#8A817A]">
                        누적 {record.scriptureReading.completedChapters} /{" "}
                        {scripture?.totalChapters ?? record.scriptureReading.completedChapters}장
                      </p>
                      {record.content ? (
                        <p className="mt-2 text-[13px] leading-6 text-[#6E655D]">
                          {record.content}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-[18px] border border-dashed border-gray-200 bg-[#FAFAF8] px-4 py-4 text-[13px] leading-6 text-[#8A817A]">
                이 날짜에는 공유된 성경일독 기록이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
