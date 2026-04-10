"use client";

import { useEffect, useMemo, useState } from "react";

export type BibleFeedComment = {
  id: string;
  author: string;
  text: string;
};

export type BibleReadingFeedPost = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorProfileUrl?: string;
  bookName: string;
  rangeStart: number;
  rangeEnd: number;
  rangeLabel: string;
  completed: number;
  total: number;
  progressPercent: number;
  reflection: string;
  createdAt: string;
  likes: number;
  cheers: number;
  comments: BibleFeedComment[];
  likedByMe: boolean;
  cheeredByMe: boolean;
  isMine: boolean;
};

const STORAGE_KEY = "bible-reading-feed-v1";
const UPDATE_EVENT = "bible-reading-feed-updated";

const seedPosts: BibleReadingFeedPost[] = [
  {
    id: "seed-john-1",
    authorName: "다은",
    authorHandle: "@daeun",
    bookName: "요한복음",
    rangeStart: 4,
    rangeEnd: 5,
    rangeLabel: "4장 - 5장",
    completed: 5,
    total: 21,
    progressPercent: 24,
    reflection: "짧게 읽었지만 오늘은 말씀 한 구절이 오래 남았어요.",
    createdAt: "2026-04-10T08:20:00.000+09:00",
    likes: 14,
    cheers: 6,
    comments: [
      { id: "c1", author: "현우", text: "오늘도 꾸준함이 정말 좋네요." },
    ],
    likedByMe: false,
    cheeredByMe: false,
    isMine: false,
  },
  {
    id: "seed-john-0",
    authorName: "다은",
    authorHandle: "@daeun",
    bookName: "요한복음",
    rangeStart: 2,
    rangeEnd: 3,
    rangeLabel: "2장 - 3장",
    completed: 3,
    total: 21,
    progressPercent: 14,
    reflection: "짧게 읽고 조용히 묵상했어요.",
    createdAt: "2026-04-08T07:15:00.000+09:00",
    likes: 8,
    cheers: 3,
    comments: [],
    likedByMe: false,
    cheeredByMe: false,
    isMine: false,
  },
  {
    id: "seed-matthew-1",
    authorName: "소연",
    authorHandle: "@soyeon",
    bookName: "마태복음",
    rangeStart: 10,
    rangeEnd: 12,
    rangeLabel: "10장 - 12장",
    completed: 12,
    total: 28,
    progressPercent: 43,
    reflection: "읽은 범위가 길진 않았는데 마음이 차분해졌어요.",
    createdAt: "2026-04-09T21:10:00.000+09:00",
    likes: 9,
    cheers: 4,
    comments: [],
    likedByMe: false,
    cheeredByMe: false,
    isMine: false,
  },
  {
    id: "seed-matthew-0",
    authorName: "소연",
    authorHandle: "@soyeon",
    bookName: "마태복음",
    rangeStart: 7,
    rangeEnd: 9,
    rangeLabel: "7장 - 9장",
    completed: 9,
    total: 28,
    progressPercent: 32,
    reflection: "말씀을 천천히 읽으니 더 오래 남았어요.",
    createdAt: "2026-04-06T22:00:00.000+09:00",
    likes: 7,
    cheers: 2,
    comments: [],
    likedByMe: false,
    cheeredByMe: false,
    isMine: false,
  },
  {
    id: "seed-genesis-1",
    authorName: "민지",
    authorHandle: "@minji",
    bookName: "창세기",
    rangeStart: 21,
    rangeEnd: 23,
    rangeLabel: "21장 - 23장",
    completed: 23,
    total: 50,
    progressPercent: 46,
    reflection: "오늘 읽은 범위가 생각보다 깊게 남아서 기록해 둡니다.",
    createdAt: "2026-04-09T07:40:00.000+09:00",
    likes: 11,
    cheers: 7,
    comments: [
      { id: "c2", author: "준서", text: "따뜻한 나눔 감사합니다." },
    ],
    likedByMe: false,
    cheeredByMe: false,
    isMine: false,
  },
  {
    id: "seed-genesis-0",
    authorName: "민지",
    authorHandle: "@minji",
    bookName: "창세기",
    rangeStart: 18,
    rangeEnd: 20,
    rangeLabel: "18장 - 20장",
    completed: 20,
    total: 50,
    progressPercent: 40,
    reflection: "한 장 한 장 읽을수록 흐름이 더 보이는 것 같아요.",
    createdAt: "2026-04-04T06:50:00.000+09:00",
    likes: 6,
    cheers: 4,
    comments: [],
    likedByMe: false,
    cheeredByMe: false,
    isMine: false,
  },
];

export function getLatestBiblePostsByAuthor(posts: BibleReadingFeedPost[]) {
  const seen = new Set<string>();

  return posts.filter((post) => {
    const key = post.authorHandle || post.authorName;
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
    bookName: string;
    rangeStart: number;
    rangeEnd: number;
    completed: number;
    total: number;
    reflection: string;
  }) => {
    const nextPost: BibleReadingFeedPost = {
      id: `post-${Date.now()}`,
      authorName: input.authorName,
      authorHandle: `@${input.authorName}`,
      bookName: input.bookName,
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
      rangeLabel: `${input.rangeStart}장 - ${input.rangeEnd}장`,
      completed: input.completed,
      total: input.total,
      progressPercent: Math.round((input.completed / input.total) * 100),
      reflection: input.reflection.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      cheers: 0,
      comments: [],
      likedByMe: false,
      cheeredByMe: false,
      isMine: true,
    };

    const nextPosts = [nextPost, ...sortedPosts];
    setPosts(nextPosts);
    writePosts(nextPosts);
  };

  const updatePost = (
    postId: string,
    updater: (post: BibleReadingFeedPost) => BibleReadingFeedPost,
  ) => {
    const nextPosts = sortedPosts.map((post) =>
      post.id === postId ? updater(post) : post,
    );
    setPosts(nextPosts);
    writePosts(nextPosts);
  };

  const toggleLike = (postId: string) => {
    updatePost(postId, (post) => ({
      ...post,
      likedByMe: !post.likedByMe,
      likes: post.likedByMe ? Math.max(0, post.likes - 1) : post.likes + 1,
    }));
  };

  const toggleCheer = (postId: string) => {
    updatePost(postId, (post) => ({
      ...post,
      cheeredByMe: !post.cheeredByMe,
      cheers: post.cheeredByMe ? Math.max(0, post.cheers - 1) : post.cheers + 1,
    }));
  };

  const addComment = (postId: string, author: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    updatePost(postId, (post) => ({
      ...post,
      comments: [
        ...post.comments,
        {
          id: `comment-${Date.now()}`,
          author,
          text: trimmed,
        },
      ],
    }));
  };

  return {
    posts: sortedPosts,
    createPost,
    toggleLike,
    toggleCheer,
    addComment,
  };
}
