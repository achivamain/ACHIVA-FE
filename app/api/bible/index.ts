import type {
  CreateScriptureReadingArticleInput,
  ScriptureProgressItem,
  ScriptureReadingCalendarItem,
} from "@/features/bible/types";
import type { ScriptureReadingPostRes } from "@/types/Post";

export async function fetchScriptureProgress() {
  const response = await fetch("/api/scripture-reading/progress/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch scripture progress");
  }

  const json = await response.json();
  const data = json.data ?? json;
  return (data.items ?? []) as ScriptureProgressItem[];
}

export async function saveScriptureProgress(input: {
  scriptureId: string;
  completedChapters: number;
}) {
  const response = await fetch(
    `/api/scripture-reading/progress/me/scriptures/${encodeURIComponent(input.scriptureId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completedChapters: input.completedChapters,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save scripture progress");
  }

  const json = await response.json();
  return (json.data ?? json) as ScriptureProgressItem;
}

export async function createScriptureReadingArticle(
  input: CreateScriptureReadingArticleInput,
) {
  const response = await fetch("/api/scripture-reading/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create scripture reading article");
  }

  const json = await response.json();
  return (json.data ?? json) as ScriptureReadingPostRes;
}

export async function fetchScriptureReadingCalendar(
  memberId: string,
  yearMonth: string,
) {
  const response = await fetch(
    `/api/members/${encodeURIComponent(memberId)}/scripture-reading/articles/calendar?yearMonth=${encodeURIComponent(yearMonth)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch scripture reading calendar");
  }

  const json = await response.json();
  const data = json.data ?? json;
  return (data.items ?? []) as ScriptureReadingCalendarItem[];
}
