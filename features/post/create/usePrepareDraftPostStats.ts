"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDraftPostStore } from "@/store/CreatePostStore";

type UserStats = {
  weeklyWorkoutCount: number;
  continuousGoalWeeks: number;
};

export function usePrepareDraftPostStats() {
  const setPost = useDraftPostStore.use.setPost();

  const { data: userStats } = useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me/stats`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("network error");
      }
      return (await res.json()).data as UserStats;
    },
  });

  const expectedUserStats = useMemo(() => {
    if (!userStats) return null;

    const nextWeeklyWorkoutCount = userStats.weeklyWorkoutCount + 1;
    const nextContinuousGoalWeeks =
      nextWeeklyWorkoutCount === 3
        ? userStats.continuousGoalWeeks + 1
        : userStats.continuousGoalWeeks;

    return {
      weeklyWorkoutCount: nextWeeklyWorkoutCount,
      continuousGoalWeeks: nextContinuousGoalWeeks,
    };
  }, [userStats]);

  useEffect(() => {
    if (expectedUserStats) {
      setPost(expectedUserStats);
    }
  }, [expectedUserStats, setPost]);
}
