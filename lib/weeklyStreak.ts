import {
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfWeek,
} from "date-fns";
import type { PostsData } from "@/types/responses";

export const WEEK_STARTS_ON = 1 as const;
const MEMBER_POSTS_PAGE_SIZE = 20;

export function getCurrentWeekRange(baseDate = new Date()) {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: WEEK_STARTS_ON });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: WEEK_STARTS_ON });

  return { weekStart, weekEnd };
}

export function isDateInWeekRange(date: Date, weekStart: Date, weekEnd: Date) {
  return !isBefore(date, weekStart) && !isAfter(date, weekEnd);
}

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export async function fetchWeeklyActiveDateKeys(
  userId: string,
  baseDate = new Date(),
) {
  const { weekStart, weekEnd } = getCurrentWeekRange(baseDate);
  const activeDateKeys = new Set<string>();
  let page = 0;

  while (true) {
    const response = await fetch(
      `/api/members/getPosts?pageParam=${page}&size=${MEMBER_POSTS_PAGE_SIZE}&id=${userId}&sort=DESC`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weekly posts");
    }

    const json = await response.json();
    const data = json.data as PostsData;
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

      activeDateKeys.add(toDateKey(postDate));
    }

    if (reachedBeforeWeek || data.last) {
      break;
    }

    page += 1;
  }

  return activeDateKeys;
}
