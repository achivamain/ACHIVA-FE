"use client";

// 목표 관련 API 통신 관리 훅

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Goal,
  GoalsResponse,
  GoalResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
} from "@/types/Goal";

// React Query Key
export const goalKeys = {
  all: ["goals"] as const,
  active: () => [...goalKeys.all, "active"] as const,
  archived: () => [...goalKeys.all, "archived"] as const,
  detail: (id: string) => [...goalKeys.all, "detail", id] as const,
};

// 기본(활성화) 상태의 목표 조회
export const useActiveGoals = () => {
  return useQuery({
    queryKey: goalKeys.active(),
    queryFn: async () => {
      const res = await fetch("/api/goals", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("목표 조회 실패");
      }

      const response: GoalsResponse = await res.json();
      return response.data.goals;
    },
  });
};

// 보관 상태의 목표 조회
export const useArchivedGoals = () => {
  return useQuery({
    queryKey: goalKeys.archived(),
    queryFn: async () => {
      const res = await fetch("/api/goals/archived", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("보관 상태 목표 조회 실패");
      }

      const response: GoalsResponse = await res.json();
      return response.data.goals;
    },
  });
};

// 목표 카테고리별 분류
export const categorizeGoals = (goals: Goal[] | undefined) => {
  if (!goals) {
    return {
      vision: null as Goal | null,
      missions: [] as Goal[],
      mindsets: [] as Goal[],
    };
  }

  return {
    vision: goals.find((g) => g.category === "VISION") ?? null,
    missions: goals.filter((g) => g.category === "MISSION"),
    mindsets: goals.filter((g) => g.category === "MINDSET"),
  };
};

// 목표 클릭 카운트 증가 처리
export const useClickGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}/click`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("목표 클릭 처리 실패");
      }

      const response: GoalResponse = await res.json();
      return response.data;
    },

    // 낙관적 업데이트
    onMutate: async (goalId: string) => {
      await queryClient.cancelQueries({ queryKey: goalKeys.active() });
      const previousGoals = queryClient.getQueryData<Goal[]>(goalKeys.active());

      queryClient.setQueryData<Goal[]>(goalKeys.active(), (old) =>
        old?.map((goal) =>
          goal.id === goalId
            ? { ...goal, clickCount: goal.clickCount + 1 }
            : goal
        )
      );
      return { previousGoals };
    },
    onError: (_err, _goalId, context) => {
      // 에러 시 롤백
      if (context?.previousGoals) {
        queryClient.setQueryData(goalKeys.active(), context.previousGoals);
      }
    },

    // 새로고침
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.active() });
    },
  });
};

// 보관 여부 Toggle
export const useToggleArchive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("목표 보관여부 토글 실패");
      }

      const response: GoalResponse = await res.json();
      return response.data;
    },
    onSuccess: () => {
      // 새로고침
      queryClient.invalidateQueries({ queryKey: goalKeys.active() });
      queryClient.invalidateQueries({ queryKey: goalKeys.archived() });
    },
  });
};

// 목표 생성
export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGoalRequest) => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("목표 생성 실패");
      }

      const response: GoalResponse = await res.json();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.active() });
    },
  });
};

// 목표 수정
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      data,
    }: {
      goalId: string;
      data: UpdateGoalRequest;
    }) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("목표 수정 중 실패");
      }

      const response: GoalResponse = await res.json();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.active() });
      queryClient.invalidateQueries({ queryKey: goalKeys.archived() });
    },
  });
};

// 목표 삭제
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("목표 삭제 실패");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.active() });
      queryClient.invalidateQueries({ queryKey: goalKeys.archived() });
    },
  });
};

// 초기 목표 데이터 생성하기
export const useSeedDefaultGoals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/goals/seed-defaults", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("초기 목표 생성 실패");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.active() });
    },
  });
};
