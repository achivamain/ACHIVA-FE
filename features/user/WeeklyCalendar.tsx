"use client";

import { useEffect, useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  isBefore,
} from "date-fns";
import { LoadingIcon } from "@/components/Icons";
import type { PostsData } from "@/types/responses";

type WeeklyCalendarProps = {
  userId: string;
};

const PAGE_SIZE = 20;

export default function WeeklyCalendar({ userId }: WeeklyCalendarProps) {
  const [activeDates, setActiveDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { weekStart, weekDays } = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) =>
      addDays(weekStart, i),
    );
    return { weekStart, weekDays };
  }, []);

  useEffect(() => {
    async function fetchWeeklyPosts() {
      try {
        setIsLoading(true);
        const collectedDates: Date[] = [];
        let page = 0;

        while (true) {
          const response = await fetch(
            `/api/members/getPosts?pageParam=${page}&size=${PAGE_SIZE}&id=${userId}&sort=DESC`,
            { method: "GET", headers: { "Content-Type": "application/json" } },
          );

          if (!response.ok) throw new Error("Failed to fetch posts");

          const json = await response.json();
          const data = json.data as PostsData;

          // 게시글 or 컨텐츠가 없는 경우
          if (!data?.content?.length) break;

          let reachedBeforeWeek = false;
          for (const post of data.content) {
            const postDate = parseISO(post.createdAt);
            // 이번 주 시작 이전 게시글 찾으면 종료
            if (isBefore(postDate, weekStart)) {
              reachedBeforeWeek = true;
              break;
            }
            collectedDates.push(postDate);
          }

          // 이번 주 이전 게시글 발견 또는 마지막 페이지면 종료
          if (reachedBeforeWeek || data.last) break;

          page++;
        }

        setActiveDates(collectedDates);
      } catch (error) {
        console.error("Error fetching streak data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchWeeklyPosts();
    }
  }, [userId, weekStart]);

  return (
    <div className="flex flex-col w-full max-w-[844px] bg-white rounded-[16px] py-4 px-3 sm:py-5 sm:px-6 shadow-[4px_4px_10px_0px_rgba(51,38,174,0.04)] mt-4 mb-4">
      <div className="flex justify-between items-end mb-3 sm:mb-4">
        <h3 className="font-bold text-[15px] sm:text-[16px] text-[#343330]">
          이번 주 스트릭
        </h3>
        <span className="text-[11px] sm:text-xs text-[#9A9C9F] font-medium">
          매일매일 꾸준히!
        </span>
      </div>

      <div className="flex justify-between items-center w-full relative min-h-[50px] sm:min-h-[60px]">
        {isLoading ? (
          <div className="flex w-full justify-center items-center py-2">
            <LoadingIcon color="text-theme" />
          </div>
        ) : (
          weekDays.map((day, idx) => {
            const isToday = isSameDay(day, new Date());
            const hasWorkout = activeDates.some((active) =>
              isSameDay(active, day),
            );

            return (
              <div
                key={format(day, "yyyy-MM-dd")}
                className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 relative z-10"
              >
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold ${
                    isToday ? "text-theme" : "text-[#9A9C9F]"
                  }`}
                >
                  {format(day, "E")}
                </span>

                <div
                  className={`flex flex-shrink-0 items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 ${
                    hasWorkout
                      ? "bg-[#FFF4E5] shadow-[0_0_10px_rgba(255,165,0,0.3)] scale-110"
                      : isToday
                        ? "bg-gray-100 border border-theme border-opacity-30"
                        : "bg-[#F5F6F8]"
                  }`}
                >
                  {hasWorkout ? (
                    <span className="text-base sm:text-lg animate-pulse select-none leading-none">
                      🔥
                    </span>
                  ) : (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E5E7EB]"></div>
                  )}
                </div>

                {/* 연결선 표시 */}
                {idx < 6 && (
                  <div
                    className="absolute top-[28px] sm:top-[34px] left-[50%] w-full h-[2px] bg-[#F5F6F8] -z-10"
                    style={{ width: "calc(100% + 5px)" }}
                  >
                    {hasWorkout &&
                      activeDates.some((a) =>
                        isSameDay(a, addDays(day, 1)),
                      ) && (
                        <div className="h-full bg-gradient-to-r from-[#FFF4E5] to-[#FFF4E5]"></div>
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
