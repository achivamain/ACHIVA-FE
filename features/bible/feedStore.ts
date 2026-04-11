"use client";

import { useEffect, useMemo, useState } from "react";
import { CHEERING_CATEGORIES } from "@/lib/cheering";
import type { Cheering } from "@/types/responses";
import type { ScriptureReadingPostRes } from "@/types/Post";
import { getScriptureMeta, type ScriptureId } from "@/features/bible/mockData";

export type BibleReadingFeedPost = ScriptureReadingPostRes;

const STORAGE_KEY = "bible-reading-feed-v2";
const UPDATE_EVENT = "bible-reading-feed-updated";

function buildScriptureQuestions(scriptureId: ScriptureId, startChapter: number, endChapter: number, reflection: string) {
  return [
    {
      question: "오늘의 성경 말씀",
      content: `${scriptureId} ${startChapter}장 - ${endChapter}장`,
    },
    {
      question: "말씀 속 느낀 점",
      content: reflection.trim(),
    },
  ];
}

function buildCheering(
  id: number,
  cheeringCategory: Cheering["cheeringCategory"],
  senderId: string,
  senderName: string,
  receiverId: string,
  receiverName: string,
  articleId: string,
): Cheering {
  return {
    id,
    content: cheeringCategory,
    cheeringCategory,
    senderId,
    senderName,
    receiverId,
    receiverName,
    articleId,
    isRead: false,
    createdAt: "2026-04-10T10:00:00.000+09:00",
    updatedAt: "2026-04-10T10:00:00.000+09:00",
  };
}

function buildSeedPost(input: {
  id: string;
  memberId: string;
  memberNickName: string;
  memberProfileUrl?: string;
  scriptureId: ScriptureId;
  startChapter: number;
  endChapter: number;
  completedChapters: number;
  reflection: string;
  createdAt: string;
  cheerings?: Cheering[];
}) {
  const now = input.createdAt;

  return {
    id: input.id,
    photoUrls: [],
    title: "오늘의 성경 말씀",
    category: "성경 일독" as const,
    question: buildScriptureQuestions(
      input.scriptureId,
      input.startChapter,
      input.endChapter,
      input.reflection,
    ),
    memberId: input.memberId,
    memberNickName: input.memberNickName,
    memberProfileUrl: input.memberProfileUrl ?? "",
    memberArticleCount: 0,
    backgroundColor: "#F0E8E0" as const,
    authorCategorySeq: 0,
    createdAt: now,
    updatedAt: now,
    weeklyWorkoutCount: 0,
    continuousGoalWeeks: 0,
    cheerings: input.cheerings ?? [],
    scriptureReading: {
      scriptureId: input.scriptureId,
      startChapter: input.startChapter,
      endChapter: input.endChapter,
      completedChapters: input.completedChapters,
      readAt: input.createdAt.slice(0, 10),
    },
  } satisfies BibleReadingFeedPost;
}

const seedPosts: BibleReadingFeedPost[] = [
  buildSeedPost({
    id: "scripture-john-1",
    memberId: "member-daeun",
    memberNickName: "다은",
    scriptureId: "요한복음",
    startChapter: 4,
    endChapter: 5,
    completedChapters: 5,
    reflection: "짧게 읽었지만 오늘은 한 구절이 오래 남았어요.",
    createdAt: "2026-04-10T08:20:00.000+09:00",
    cheerings: [
      buildCheering(
        1,
        CHEERING_CATEGORIES[0],
        "member-suhyeon",
        "수현",
        "member-daeun",
        "다은",
        "scripture-john-1",
      ),
    ],
  }),
  buildSeedPost({
    id: "scripture-john-0",
    memberId: "member-daeun",
    memberNickName: "다은",
    scriptureId: "요한복음",
    startChapter: 2,
    endChapter: 3,
    completedChapters: 3,
    reflection: "조용히 묵상하며 읽은 저녁이었어요.",
    createdAt: "2026-04-08T07:15:00.000+09:00",
  }),
  buildSeedPost({
    id: "scripture-matthew-1",
    memberId: "member-soyeon",
    memberNickName: "소연",
    scriptureId: "마태복음",
    startChapter: 10,
    endChapter: 12,
    completedChapters: 12,
    reflection: "읽은 범위는 길지 않았지만 마음이 차분해졌어요.",
    createdAt: "2026-04-09T21:10:00.000+09:00",
    cheerings: [
      buildCheering(
        2,
        CHEERING_CATEGORIES[1],
        "member-yuna",
        "유나",
        "member-soyeon",
        "소연",
        "scripture-matthew-1",
      ),
    ],
  }),
  buildSeedPost({
    id: "scripture-matthew-0",
    memberId: "member-soyeon",
    memberNickName: "소연",
    scriptureId: "마태복음",
    startChapter: 7,
    endChapter: 9,
    completedChapters: 9,
    reflection: "천천히 읽으니 더 오래 남는 말씀이 있었어요.",
    createdAt: "2026-04-06T22:00:00.000+09:00",
  }),
  buildSeedPost({
    id: "scripture-genesis-1",
    memberId: "member-minji",
    memberNickName: "민지",
    scriptureId: "창세기",
    startChapter: 21,
    endChapter: 23,
    completedChapters: 23,
    reflection: "오늘 읽은 범위가 깊게 남아서 기록해 두고 싶었어요.",
    createdAt: "2026-04-09T07:40:00.000+09:00",
    cheerings: [
      buildCheering(
        3,
        CHEERING_CATEGORIES[2],
        "member-jihun",
        "지훈",
        "member-minji",
        "민지",
        "scripture-genesis-1",
      ),
    ],
  }),
  buildSeedPost({
    id: "scripture-genesis-0",
    memberId: "member-minji",
    memberNickName: "민지",
    scriptureId: "창세기",
    startChapter: 18,
    endChapter: 20,
    completedChapters: 20,
    reflection: "한 장씩 읽을수록 흐름이 조금씩 더 보이는 것 같아요.",
    createdAt: "2026-04-04T06:50:00.000+09:00",
  }),
];

export function getScriptureReflection(post: BibleReadingFeedPost) {
  return post.question.find((item) => item.question === "말씀 속 느낀 점")?.content ?? "";
}

export function getScriptureRangeLabel(post: BibleReadingFeedPost) {
  const { scriptureId, startChapter, endChapter } = post.scriptureReading;
  return `${scriptureId} ${startChapter}장 - ${endChapter}장`;
}

export function getLatestBiblePostsByAuthor(posts: BibleReadingFeedPost[]) {
  const seen = new Set<string>();

  return posts.filter((post) => {
    const key = post.memberId || post.memberNickName;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function sanitizePosts(value: unknown): BibleReadingFeedPost[] {
  if (!Array.isArray(value)) {
    return seedPosts;
  }

  return value as BibleReadingFeedPost[];
}

function readPosts(): BibleReadingFeedPost[] {
  if (typeof window === "undefined") {
    return seedPosts;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedPosts;

  try {
    return sanitizePosts(JSON.parse(raw));
  } catch {
    return seedPosts;
  }
}

function writePosts(posts: BibleReadingFeedPost[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function useBibleReadingFeed() {
  const [posts, setPosts] = useState<BibleReadingFeedPost[]>(seedPosts);

  useEffect(() => {
    const sync = () => {
      setPosts(readPosts());
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(UPDATE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(UPDATE_EVENT, sync);
    };
  }, []);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [posts]);

  const createPost = (input: {
    authorName: string;
    scriptureId: ScriptureId;
    startChapter: number;
    endChapter: number;
    completedChapters: number;
    reflection: string;
  }) => {
    const scripture = getScriptureMeta(input.scriptureId);
    const now = new Date().toISOString();

    const nextPost: BibleReadingFeedPost = {
      id: `scripture-post-${Date.now()}`,
      photoUrls: [],
      title: "오늘의 성경 말씀",
      category: "성경 일독",
      question: buildScriptureQuestions(
        scripture?.name ?? input.scriptureId,
        input.startChapter,
        input.endChapter,
        input.reflection,
      ),
      memberId: "me",
      memberNickName: input.authorName,
      memberProfileUrl: "",
      memberArticleCount: 0,
      backgroundColor: "#F0E8E0",
      authorCategorySeq: 0,
      createdAt: now,
      updatedAt: now,
      weeklyWorkoutCount: 0,
      continuousGoalWeeks: 0,
      cheerings: [],
      scriptureReading: {
        scriptureId: input.scriptureId,
        startChapter: input.startChapter,
        endChapter: input.endChapter,
        completedChapters: input.completedChapters,
        readAt: now.slice(0, 10),
      },
    };

    const nextPosts = [nextPost, ...sortedPosts];
    setPosts(nextPosts);
    writePosts(nextPosts);
  };

  return {
    posts: sortedPosts,
    createPost,
  };
}
