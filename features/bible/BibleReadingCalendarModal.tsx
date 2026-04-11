"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ko } from "date-fns/locale";
import RecordCalendarBase from "@/components/calendar/RecordCalendarBase";
import { getDateKey } from "@/components/calendar/calendarUtils";
import { fetchScriptureReadingCalendar } from "@/app/api/bible";
import { getScriptureMeta } from "@/features/bible/mockData";
import { formatScriptureRangeLabel } from "@/features/bible/selectors";
import type { ScriptureReadingCalendarItem } from "@/features/bible/types";

type BibleReadingCalendarModalProps = {
  authorName: string;
  memberId: string;
  onClose: () => void;
};

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

export default function BibleReadingCalendarModal({
  authorName,
  memberId,
  onClose,
}: BibleReadingCalendarModalProps) {
  const today = useMemo(() => new Date(), []);
  const todayMonth = useMemo(() => startOfMonth(today), [today]);
  const [displayMonth, setDisplayMonth] = useState(todayMonth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const yearMonth = format(displayMonth, "yyyy-MM");
  const { data, isLoading } = useQuery({
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

  const calendarItems = data ?? [];

  const recordsByDate = useMemo(() => {
    return calendarItems.reduce<Record<string, ScriptureReadingCalendarItem[]>>(
      (acc, item) => {
        const rawDate = item.scriptureReading.readAt ?? item.createdAt;
        const key = getDateKey(parseISO(rawDate));
        const nextItems = acc[key] ?? [];
        const signature = getRecordSignature(item);

        if (nextItems.some((current) => getRecordSignature(current) === signature)) {
          return acc;
        }

        acc[key] = [...nextItems, item].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
        return acc;
      },
      {},
    );
  }, [calendarItems]);

  const markedDateKeys = useMemo(
    () => new Set(Object.keys(recordsByDate)),
    [recordsByDate],
  );
  const markedCountByDate = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(recordsByDate).map(([dateKey, records]) => [
          dateKey,
          records.length,
        ]),
      ) as Record<string, number>,
    [recordsByDate],
  );
  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedRecords = selectedDateKey
    ? recordsByDate[selectedDateKey] ?? []
    : [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] bg-black/45"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full flex-col bg-white"
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="mt-1 text-[20px] font-black text-[#4A433D]">
                {authorName}님의 성경일독 기록
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D]"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {isLoading ? (
            <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
              <div className="pb-4">
                <h4 className="text-[18px] font-bold text-[#4A433D]">
                  {format(displayMonth, "yyyy년 M월", { locale: ko })}
                </h4>
              </div>

              <div className="rounded-[18px] border border-dashed border-gray-200 bg-[#FAFAF8] px-4 py-12 text-center text-[13px] leading-6 text-[#8A817A]">
                달력을 불러오는 중입니다.
              </div>
            </div>
          ) : (
            <RecordCalendarBase
              month={displayMonth}
              onMonthChange={(date) => {
                setDisplayMonth(startOfMonth(date));
                setSelectedDate(null);
              }}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                if (!date) {
                  setSelectedDate(null);
                  return;
                }

                const nextDate = startOfMonth(date);
                setDisplayMonth(nextDate);
                setSelectedDate((current) => {
                  if (current && getDateKey(current) === getDateKey(date)) {
                    return null;
                  }

                  return date;
                });
              }}
              markedDates={markedDateKeys}
              markedCountByDate={markedCountByDate}
              currentMonth={todayMonth}
              disableAfter={today}
              limitToCurrentMonth
              topContent={
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-[18px] font-bold text-[#4A433D]">
                      {format(displayMonth, "yyyy년 M월", { locale: ko })}
                    </h4>
                  </div>
                </div>
              }
              renderSelectedPanel={(date) => (
                <>
                  <h4 className="text-[18px] font-bold text-[#4A433D]">
                    {format(date, "M월 d일 EEEE", { locale: ko })}
                  </h4>

                  {selectedRecords.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-3">
                      {selectedRecords.map((record) => {
                        const scripture = getScriptureMeta(record.scriptureReading.scriptureId);
                        return (
                        <div
                          key={record.articleId}
                          className="rounded-[18px] border border-gray-100 bg-white px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[14px] font-bold text-[#4A433D]">
                              {formatScriptureRangeLabel(
                                record.scriptureReading.scriptureId,
                                record.scriptureReading.startChapter,
                                record.scriptureReading.endChapter,
                              )}
                            </p>
                            <p className="shrink-0 text-[11px] font-medium text-[#8A817A]">
                              {format(parseISO(record.createdAt), "HH:mm")}
                            </p>
                          </div>
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
                </>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
