"use client";

import { useEffect, useState } from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { LoadingIcon } from "@/components/Icons";
import type { PostsData } from "@/types/responses";

type WeeklyCalendarProps = {
    userId: string;
};

export default function WeeklyCalendar({ userId }: WeeklyCalendarProps) {
    const [activeDates, setActiveDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 이번 주의 시작일 (월요일)
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) =>
        addDays(startDate, i)
    );

    useEffect(() => {
        async function fetchRecentPosts() {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `/api/members/getPosts?pageParam=0&id=${userId}&sort=DESC`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch posts");

                const json = await response.json();
                const data = json.data as PostsData;

                // 게시글들의 작성일을 Date 객체 배열로 변환
                const dates = data.content.map((post) => parseISO(post.createdAt));
                setActiveDates(dates);
            } catch (error) {
                console.error("Error fetching streak data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (userId) {
            fetchRecentPosts();
        }
    }, [userId]);

    return (
        <div className="flex flex-col w-full max-w-[844px] bg-white rounded-[16px] py-4 px-3 sm:py-5 sm:px-6 shadow-[4px_4px_10px_0px_rgba(51,38,174,0.04)] mt-4 mb-4">
            <div className="flex justify-between items-end mb-3 sm:mb-4">
                <h3 className="font-bold text-[15px] sm:text-[16px] text-[#343330]">이번 주 스트릭</h3>
                <span className="text-[11px] sm:text-xs text-[#9A9C9F] font-medium">매일매일 꾸준히!</span>
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
                            isSameDay(active, day)
                        );

                        return (
                            <div
                                key={idx}
                                className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 relative z-10"
                            >
                                <span
                                    className={`text-[10px] sm:text-[11px] font-semibold ${isToday ? "text-theme" : "text-[#9A9C9F]"
                                        }`}
                                >
                                    {format(day, "E")}
                                </span>

                                <div
                                    className={`flex flex-shrink-0 items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 ${hasWorkout
                                        ? "bg-[#FFF4E5] shadow-[0_0_10px_rgba(255,165,0,0.3)] scale-110"
                                        : isToday
                                            ? "bg-gray-100 border border-theme border-opacity-30"
                                            : "bg-[#F5F6F8]"
                                        }`}
                                >
                                    {hasWorkout ? (
                                        <span className="text-base sm:text-lg animate-pulse select-none leading-none">🔥</span>
                                    ) : (
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E5E7EB]"></div>
                                    )}
                                </div>

                                {/* 연결선 표시 */}
                                {idx < 6 && (
                                    <div className="absolute top-[28px] sm:top-[34px] left-[50%] w-full h-[2px] bg-[#F5F6F8] -z-10" style={{ width: "calc(100% + 5px)" }}>
                                        {hasWorkout && activeDates.some(a => isSameDay(a, addDays(day, 1))) && (
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
