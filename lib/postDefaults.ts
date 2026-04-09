import type { Category } from "@/types/Categories";
import type { DraftPost, PostPage } from "@/types/Post";

const DEFAULT_CATEGORY: Category = "오늘 은혜";

const defaultTitleByCategory: Record<Category, string> = {
  "오늘 은혜": "오늘의 은혜",
  "성경 일독": "오늘의 성경 말씀",
  "교회 앨범": "오늘의 교회",
};

const defaultSubtitlesByCategory: Record<Category, string[]> = {
  "오늘 은혜": ["오늘의 은혜", "감사의 기도"],
  "성경 일독": ["오늘의 성경 말씀", "말씀 속 느낀 점"],
  "교회 앨범": ["오늘 교회 속 이야기"],
};

export function getDefaultPostTitle(category?: Category) {
  return defaultTitleByCategory[category ?? DEFAULT_CATEGORY];
}

export function createDefaultPostPages(category?: Category): PostPage[] {
  return defaultSubtitlesByCategory[category ?? DEFAULT_CATEGORY].map(
    (subtitle) => ({
      id: crypto.randomUUID(),
      subtitle,
      content: "",
    }),
  );
}

export function createInitialDraftPost(category?: Category): DraftPost {
  return {
    backgroundColor: "#F0E8E0",
    pages: createDefaultPostPages(category),
  };
}
