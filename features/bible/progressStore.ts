"use client";

import { useEffect, useMemo, useState } from "react";
import {
  bibleBooks,
  initialReadingRangesByScriptureId,
  type ScriptureMeta,
  type ReadingRange,
} from "@/features/bible/mockData";

const STORAGE_KEY = "bible-reading-progress-v1";
const UPDATE_EVENT = "bible-reading-progress-updated";

export type BibleProgressState = {
  completedByBookId: Record<string, number>;
  updatedAtByBookId: Record<string, string>;
};

function getFilledChapterSet(ranges: ReadingRange[]) {
  const filledChapters = new Set<number>();

  for (const range of ranges) {
    const start = Math.min(range.startChapter, range.endChapter);
    const end = Math.max(range.startChapter, range.endChapter);

    for (let chapter = start; chapter <= end; chapter += 1) {
      filledChapters.add(chapter);
    }
  }

  return filledChapters;
}

function getCompletionCount(totalChapters: number, filledChapters: Set<number>) {
  let count = 0;

  for (let chapter = 1; chapter <= totalChapters; chapter += 1) {
    if (filledChapters.has(chapter)) {
      count += 1;
    }
  }

  return count;
}

function buildInitialBibleProgress(books: ScriptureMeta[]): BibleProgressState {
  const seedDate = "2026-04-10T10:00:00.000+09:00";
  const completedByBookId = Object.fromEntries(
    books.map((book) => {
      const filled = getFilledChapterSet(
        initialReadingRangesByScriptureId[book.id] ?? [],
      );
      return [book.id, getCompletionCount(book.totalChapters, filled)];
    }),
  ) as Record<string, number>;

  const updatedAtByBookId = Object.fromEntries(
    Object.entries(completedByBookId)
      .filter(([, completed]) => completed > 0)
      .map(([bookId]) => [bookId, seedDate]),
  ) as Record<string, string>;

  return {
    completedByBookId,
    updatedAtByBookId,
  };
}

const initialBibleProgress = buildInitialBibleProgress(bibleBooks);

function sanitizeProgressState(value: unknown): BibleProgressState {
  if (!value || typeof value !== "object") {
    return initialBibleProgress;
  }

  const candidate = value as Partial<BibleProgressState>;

  return {
    completedByBookId:
      candidate.completedByBookId &&
      typeof candidate.completedByBookId === "object"
        ? (candidate.completedByBookId as Record<string, number>)
        : initialBibleProgress.completedByBookId,
    updatedAtByBookId:
      candidate.updatedAtByBookId &&
      typeof candidate.updatedAtByBookId === "object"
        ? (candidate.updatedAtByBookId as Record<string, string>)
        : initialBibleProgress.updatedAtByBookId,
  };
}

export function readBibleProgress(): BibleProgressState {
  if (typeof window === "undefined") {
    return initialBibleProgress;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return initialBibleProgress;
  }

  try {
    return sanitizeProgressState(JSON.parse(raw));
  } catch {
    return initialBibleProgress;
  }
}

function writeBibleProgress(nextState: BibleProgressState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function useBibleProgress() {
  const [progress, setProgress] = useState<BibleProgressState>(initialBibleProgress);

  useEffect(() => {
    const sync = () => {
      setProgress(readBibleProgress());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(UPDATE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(UPDATE_EVENT, sync);
    };
  }, []);

  const activeBooks = useMemo(() => {
    return bibleBooks
      .map((book) => {
        const completed = Math.min(
          book.totalChapters,
          Math.max(0, progress.completedByBookId[book.id] ?? 0),
        );

        return {
          ...book,
          completed,
          progressPercent: Math.round((completed / book.totalChapters) * 100),
          lastReadChapter: completed,
          updatedAt: progress.updatedAtByBookId[book.id] ?? "",
        };
      })
      .filter((book) => book.completed > 0)
      .sort((a, b) => {
        if (a.updatedAt && b.updatedAt) {
          return b.updatedAt.localeCompare(a.updatedAt);
        }
        return b.completed - a.completed;
      });
  }, [progress]);

  const updateBookProgress = (bookId: string, completed: number) => {
    const book = bibleBooks.find((item) => item.id === bookId);
    if (!book) return;

    const safeCompleted = Math.min(book.totalChapters, Math.max(0, completed));
    const nextState: BibleProgressState = {
      completedByBookId: {
        ...progress.completedByBookId,
        [bookId]: safeCompleted,
      },
      updatedAtByBookId: {
        ...progress.updatedAtByBookId,
        [bookId]: new Date().toISOString(),
      },
    };

    setProgress(nextState);
    writeBibleProgress(nextState);
  };

  return {
    progress,
    activeBooks,
    updateBookProgress,
  };
}
