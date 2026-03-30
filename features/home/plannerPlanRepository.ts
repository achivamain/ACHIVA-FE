"use client";

// TO-DO: 백엔드 API 개발되면 대체해야함
import type { Category } from "@/types/Categories";

export type PlannerPlanEntry = {
  date: string;
  categories: Category[];
  updatedAt: string;
};

export type PlannerPlanMap = Record<string, PlannerPlanEntry>;

export interface PlannerPlanRepository {
  listPlans(userId: string): Promise<PlannerPlanMap>;
  upsertPlan(
    userId: string,
    date: string,
    categories: Category[],
  ): Promise<PlannerPlanMap>;
}

const STORAGE_PREFIX = "home-planner-plans";

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function parseStoredPlans(raw: string | null): PlannerPlanMap {
  if (!raw) return {};

  try {
    return JSON.parse(raw) as PlannerPlanMap;
  } catch (error) {
    console.error("Failed to parse planner plans", error);
    return {};
  }
}

function readPlans(userId: string): PlannerPlanMap {
  if (typeof window === "undefined") return {};
  return parseStoredPlans(window.localStorage.getItem(getStorageKey(userId)));
}

function writePlans(userId: string, plans: PlannerPlanMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(plans));
  window.dispatchEvent(
    new CustomEvent("home-planner-plans-updated", { detail: { userId } }),
  );
}

export const localPlannerPlanRepository: PlannerPlanRepository = {
  async listPlans(userId) {
    return readPlans(userId);
  },

  async upsertPlan(userId, date, categories) {
    const currentPlans = readPlans(userId);
    const nextPlans = { ...currentPlans };

    if (categories.length === 0) {
      delete nextPlans[date];
    } else {
      nextPlans[date] = {
        date,
        categories,
        updatedAt: new Date().toISOString(),
      };
    }

    writePlans(userId, nextPlans);
    return nextPlans;
  },
};
