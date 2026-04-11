import { bibleBooks } from "@/features/bible/mockData";
import type {
  ActiveScriptureProgress,
  ScriptureProgressItem,
  ScriptureProgressState,
  ScriptureReadingFeedPost,
} from "@/features/bible/types";
import type { ScriptureReadingPostRes } from "@/types/Post";

export function isScriptureReadingPost(
  post: unknown,
): post is ScriptureReadingPostRes {
  if (!post || typeof post !== "object") {
    return false;
  }

  const candidate = post as Partial<ScriptureReadingPostRes>;
  return (
    candidate.category === "성경 일독" &&
    !!candidate.scriptureReading &&
    typeof candidate.scriptureReading.scriptureId === "string"
  );
}

export function getScriptureReflection(post: ScriptureReadingFeedPost) {
  return post.question[0]?.content?.trim() ?? "";
}

export function getScriptureRangeLabel(post: ScriptureReadingFeedPost) {
  const { scriptureId, startChapter, endChapter } = post.scriptureReading;
  return `${scriptureId} ${startChapter}장 - ${endChapter}장`;
}

export function toScriptureProgressState(
  items: ScriptureProgressItem[],
): ScriptureProgressState {
  return {
    completedByScriptureId: Object.fromEntries(
      items.map((item) => [item.scriptureId, item.completedChapters]),
    ) as Record<string, number>,
    updatedAtByScriptureId: Object.fromEntries(
      items.map((item) => [item.scriptureId, item.updatedAt]),
    ) as Record<string, string>,
  };
}

export function getActiveScriptureProgress(
  progress: ScriptureProgressState,
): ActiveScriptureProgress[] {
  return bibleBooks
    .map((book) => {
      const completed = Math.min(
        book.totalChapters,
        Math.max(0, progress.completedByScriptureId[book.id] ?? 0),
      );

      return {
        ...book,
        completed,
        progressPercent: Math.round((completed / book.totalChapters) * 100),
        lastReadChapter: completed,
        updatedAt: progress.updatedAtByScriptureId[book.id] ?? "",
      };
    })
    .filter((book) => book.completed > 0)
    .sort((a, b) => {
      if (a.updatedAt && b.updatedAt) {
        return b.updatedAt.localeCompare(a.updatedAt);
      }

      return b.completed - a.completed;
    });
}
