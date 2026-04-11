import { format } from "date-fns";

export const WEEK_STARTS_ON = 1 as const;
export const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export function getDayIndex(date: Date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function getDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}
