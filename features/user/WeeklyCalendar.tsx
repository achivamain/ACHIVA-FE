"use client";

import { useEffect, useState, useMemo } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { LoadingIcon } from "@/components/Icons";
import { fetchWeeklyActiveDateKeys, getCurrentWeekRange, toDateKey } from "@/lib/weeklyStreak";

type WeeklyCalendarProps = {
  userId: string;
};

export default function WeeklyCalendar({ userId }: WeeklyCalendarProps) {
  const [activeDateKeys, setActiveDateKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const referenceDate = useMemo(() => new Date(), []);

  const { weekStart, weekDays } = useMemo(() => {
    const { weekStart } = getCurrentWeekRange(referenceDate);
    const weekDays = Array.from({ length: 7 }).map((_, i) =>
      addDays(weekStart, i),
    );
    return { weekStart, weekDays };
  }, [referenceDate]);

  useEffect(() => {
    async function fetchWeeklyPosts() {
      try {
        setIsLoading(true);
        const nextActiveDateKeys = await fetchWeeklyActiveDateKeys(
          userId,
          referenceDate,
        );
        setActiveDateKeys(nextActiveDateKeys);
      } catch (error) {
        console.error("Error fetching streak data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchWeeklyPosts();
    }
  }, [referenceDate, userId, weekStart]);

  return (
    <div className="flex flex-col w-full max-w-[844px] bg-white rounded-[20px] py-5 px-4 sm:py-6 sm:px-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-[16px] sm:text-[18px] text-gray-900 tracking-tight flex items-center gap-1.5">
            이번 주 연속 은혜 <span className="text-xl">✨</span>
          </h3>
        </div>
        <div className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <span className="text-[12px] text-gray-500 font-medium">
            매일 꾸준히 기록해봐요!
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center w-full relative min-h-[60px] sm:min-h-[70px]">
        {isLoading ? (
          <div className="flex w-full justify-center items-center py-2 h-full">
            <LoadingIcon color="text-orange-500" />
          </div>
        ) : (
          weekDays.map((day, idx) => {
            const isToday = isSameDay(day, new Date());
            const hasWorkout = activeDateKeys.has(toDateKey(day));

            return (
              <div
                key={format(day, "yyyy-MM-dd")}
                className="flex flex-col items-center justify-center gap-2 relative z-10 w-full"
              >
                <span
                  className={`text-[11px] sm:text-[12px] font-bold ${
                    isToday ? "text-orange-500" : "text-gray-400"
                  }`}
                >
                  {format(day, "EE")}
                </span>

                <div
                  className={`flex flex-shrink-0 items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 transition-all duration-300 ${
                    hasWorkout
                      ? "bg-gradient-to-tr from-orange-400 to-amber-300 border-white shadow-[0_4px_12px_rgba(251,146,60,0.4)] scale-110 z-20"
                      : isToday
                        ? "bg-white border-orange-200 shadow-sm"
                        : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {hasWorkout ? (
                    <span className="text-lg sm:text-xl drop-shadow-md select-none leading-none -mt-[2px]">
                      🔥
                    </span>
                  ) : isToday ? (
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-300 animate-pulse"></div>
                  ) : (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-200"></div>
                  )}
                </div>

                {/* 연결선 표시 */}
                {idx < 6 && (
                  <div
                    className="absolute top-[34px] sm:top-[42px] left-[50%] w-full h-[3px] bg-gray-100 -z-10 rounded-full"
                    style={{ width: "calc(100% + 10px)" }}
                  >
                    {hasWorkout && activeDateKeys.has(toDateKey(addDays(day, 1))) && (
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-300 to-amber-300 shadow-[0_0_8px_rgba(251,146,60,0.5)]"></div>
                      )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
