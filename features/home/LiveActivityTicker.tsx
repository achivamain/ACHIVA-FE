"use client";

import { useEffect, useState } from "react";
import { isBefore, parseISO } from "date-fns";
import {
  fetchWeeklyActiveDateKeys,
  getCurrentWeekRange,
  isDateInWeekRange,
} from "@/lib/weeklyStreak";
import type { PostsData } from "@/types/responses";

type TickerActivity = {
  id: string;
  memberNickName: string;
  weeklyCount: number;
};

type TickerEntry =
  | {
      id: string;
      type: "fallback";
      message: string;
    }
  | {
      id: string;
      type: "activity";
      memberNickName: string;
      weeklyCount: number;
    };

const MAX_TICKER_USERS = 10;
const LOAD_MESSAGE = "기록을 조회하는 중이에요. 오늘 운동 하셨나요?";

type FeedAuthor = {
  id: string;
  memberNickName: string;
};

async function fetchRecentWeeklyAuthors(baseDate = new Date()) {
  const { weekStart, weekEnd } = getCurrentWeekRange(baseDate);
  const authors = new Map<string, FeedAuthor>();
  let page = 0;

  while (authors.size < MAX_TICKER_USERS) {
    const response = await fetch(`/api/feed?pageParam=${page}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch feed");
    }

    const json = await response.json();
    const data = (json.data ?? json) as PostsData;
    const posts = data?.content ?? [];

    if (posts.length === 0) {
      break;
    }

    let reachedBeforeWeek = false;

    for (const post of posts) {
      const postDate = parseISO(post.createdAt);

      if (isBefore(postDate, weekStart)) {
        reachedBeforeWeek = true;
        break;
      }

      if (!isDateInWeekRange(postDate, weekStart, weekEnd)) {
        continue;
      }

      if (!authors.has(post.memberId)) {
        authors.set(post.memberId, {
          id: post.memberId,
          memberNickName: post.memberNickName,
        });
      }

      if (authors.size === MAX_TICKER_USERS) {
        break;
      }
    }

    if (reachedBeforeWeek || data.last) {
      break;
    }

    page += 1;
  }

  return Array.from(authors.values());
}

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState<TickerActivity[]>([]);
  const [entries, setEntries] = useState<TickerEntry[]>([
    {
      id: "loading",
      type: "fallback",
      message: LOAD_MESSAGE,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadFeed() {
      try {
        const referenceDate = new Date();
        const authors = await fetchRecentWeeklyAuthors(referenceDate);
        const results = await Promise.allSettled(
          authors.map(async (author) => {
            const activeDateKeys = await fetchWeeklyActiveDateKeys(
              author.id,
              referenceDate,
            );
            return {
              ...author,
              weeklyCount: activeDateKeys.size,
            };
          }),
        );

        if (!isActive) {
          return;
        }

        const nextActivities = results.flatMap((result) =>
          result.status === "fulfilled" && result.value.weeklyCount > 0
            ? [result.value]
            : [],
        );

        setActivities(nextActivities);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Failed to load live activity", error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (activities.length === 0) return;
    if (entries.length !== activities.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 3500); // 3.5초마다 위로 롤링

    return () => clearInterval(interval);
  }, [activities.length, entries.length, isLoading]);

  useEffect(() => {
    if (isLoading) {
      setEntries([
        {
          id: "loading",
          type: "fallback",
          message: LOAD_MESSAGE,
        },
      ]);
      setCurrentIndex(0);
      return;
    }

    const nextEntries: TickerEntry[] =
      activities.length > 0
        ? activities.map((activity) => ({
            ...activity,
            type: "activity" as const,
          }))
        : [
            {
              id: "empty",
              type: "fallback" as const,
              message: "이번 주 올라온 운동 소식이 아직 없어요.",
            },
          ];

    const stagedEntries: TickerEntry[] = [
      {
        id: "loading",
        type: "fallback",
        message: "이번 주 운동 소식을 불러오는 중이에요.",
      },
      ...nextEntries,
    ];

    setEntries(stagedEntries);
    setCurrentIndex(0);

    const frame = window.requestAnimationFrame(() => {
      setCurrentIndex(1);
    });
    const cleanupTimer = window.setTimeout(() => {
      setEntries(nextEntries);
      setCurrentIndex(0);
    }, 500);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(cleanupTimer);
    };
  }, [activities, isLoading]);

  return (
    <section className="mx-5 sm:mx-auto sm:w-full sm:max-w-[640px]">
      <div className="flex w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-[20px] border border-[#FFF4EC] bg-[#FFF4EC] px-4 py-2 shadow-sm sm:px-5">
        <span className={`text-[15px] ${isLoading ? "animate-pulse" : ""}`}>
          🔥
        </span>
        <div className="relative h-[20px] flex-1 overflow-hidden">
          {entries.map((entry, index) => {
            const offsetIndex = index - currentIndex;
            let transformY = offsetIndex * 100;
            const opacity = index === currentIndex ? 1 : 0;

            if (offsetIndex < 0) {
              transformY = (entries.length + offsetIndex) * 100;
            }

            return (
              <div
                key={entry.id}
                className="absolute left-0 flex w-full items-center gap-1.5 transition-all duration-500 ease-in-out"
                style={{
                  transform: `translateY(${transformY}%)`,
                  opacity,
                }}
              >
                {entry.type === "activity" ? (
                  <span className="truncate pt-[1px] text-[13px] font-medium text-[#4B5563]">
                    <strong className="font-bold text-[#D96B2B]">
                      {entry.memberNickName}
                    </strong>
                    님이{" "}
                    <strong className="font-bold text-[#1A1A1A]">
                      주 {entry.weeklyCount}회 운동
                    </strong>
                    을 달성했어요! 🎉
                  </span>
                ) : (
                  <span className="truncate pt-[1px] text-[13px] font-medium text-[#6B7280]">
                    {entry.message}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
