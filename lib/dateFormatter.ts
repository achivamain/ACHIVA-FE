import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInYears,
} from "date-fns";

export default function dateFormatter(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);
  const diffWeeks = differenceInWeeks(now, date);
  const diffYears = differenceInYears(now, date);

  if (diffMinutes < 1) {
    return "just now";
  } else if (diffHours < 1) {
    return `${diffMinutes}m`;
  } else if (diffDays < 1) {
    return `${diffHours}h`;
  } else if (diffWeeks < 1) {
    return `${diffDays}d`;
  } else if (diffYears < 1) {
    return format(date, "MMMM d"); // ex: August 13
  } else {
    return format(date, "MMMM d, yyyy"); // ex: December 27, 2023
  }
}
