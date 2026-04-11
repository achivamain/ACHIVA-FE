import type { ScriptureMeta } from "@/features/bible/mockData";
import type { ScriptureReadingPostRes } from "@/types/Post";

export type ScriptureProgressItem = {
  scriptureId: string;
  completedChapters: number;
  updatedAt: string;
};

export type ScriptureProgressState = {
  completedByScriptureId: Record<string, number>;
  updatedAtByScriptureId: Record<string, string>;
};

export type ActiveScriptureProgress = ScriptureMeta & {
  completed: number;
  progressPercent: number;
  lastReadChapter: number;
  updatedAt: string;
};

export type ScriptureReadingFeedPost = ScriptureReadingPostRes;

export type ScriptureReadingCalendarItem = {
  articleId: string;
  createdAt: string;
  content: string;
  scriptureReading: ScriptureReadingPostRes["scriptureReading"];
};

export type CreateScriptureReadingArticleInput = {
  scriptureId: string;
  startChapter: number;
  endChapter: number;
  completedChapters: number;
  content: string;
};
