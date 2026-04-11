"use client";

// 피드 페이지 리스트 전체적인 관리
import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LoadingIcon } from "@/components/Icons";
import type { PostsData } from "@/types/responses";
import type { FeedTab } from "./FeedTabs";
import FeedPost from "./FeedPost";
import BibleReadingFeedList from "@/features/bible/BibleReadingFeedList";
import BibleReadingFeedCard from "@/features/bible/BibleReadingFeedCard";
import {
  getLatestBiblePostsByAuthor,
  useBibleReadingFeed,
} from "@/features/bible/feedStore";

type FeedListProps = {
  activeTab: FeedTab;
};

export default function FeedList({ activeTab }: FeedListProps) {
  const { posts: biblePosts } = useBibleReadingFeed();

  async function fetchPosts(pageParam: number = 0): Promise<PostsData> {
    const url =
      activeTab === "모임"
        ? `/api/feed/moim?pageParam=${pageParam}`
        : `/api/feed?category=${encodeURIComponent(activeTab)}&pageParam=${pageParam}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch");
    const json = await response.json();
    const postsData = json.data ?? json;

    // 게시글에 cheerings 정보 추가
    const contentWithCheerings = await Promise.all(
      (postsData.content ?? []).map(async (post: any) => {
        const cheeringsRes = await fetch(`/api/cheerings?postId=${post.id}`);
        const cheeringsJson = await cheeringsRes.json();
        return { ...post, cheerings: cheeringsJson.data?.content ?? [] };
      }),
    );

    return {
      ...postsData,
      content: contentWithCheerings,
    } as PostsData;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["feed", activeTab],
      queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
      initialPageParam: 0,
      enabled: activeTab !== "성경 일독",
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined;
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
    });

  // 무한 스크롤 센티넬
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaderRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((p) => p.content) ?? [];
  const latestBiblePosts = useMemo(
    () => getLatestBiblePostsByAuthor(biblePosts),
    [biblePosts],
  );
  const biblePostsByAuthor = useMemo(() => {
    return biblePosts.reduce<Record<string, typeof biblePosts>>((acc, post) => {
      const key = post.memberId || post.memberNickName;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(post);
      return acc;
    }, {});
  }, [biblePosts]);
  const mergedFeedItems = useMemo(() => {
    if (activeTab !== "오늘 은혜") {
      return [];
    }

    return [
      ...posts.map((post) => ({
        kind: "post" as const,
        createdAt: post.createdAt,
        data: post,
      })),
      ...latestBiblePosts.map((post) => ({
        kind: "bible" as const,
        createdAt: post.createdAt,
        data: post,
      })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [activeTab, latestBiblePosts, posts]);

  if (activeTab === "성경 일독") {
    return <BibleReadingFeedList />;
  }

  return (
    <div className="flex flex-col gap-7">
      {isLoading && (
        <div className="w-full flex justify-center py-10">
          <LoadingIcon color="text-theme" />
        </div>
      )}

      {!isLoading &&
        ((activeTab === "오늘 은혜" && mergedFeedItems.length === 0) ||
          (activeTab !== "오늘 은혜" && posts.length === 0)) && (
        <div className="flex flex-col items-center justify-center py-20 text-[#7f7f7f]">
          <p>표시할 게시글이 없습니다</p>
        </div>
      )}

      {activeTab === "오늘 은혜"
        ? mergedFeedItems.map((item) =>
            item.kind === "post" ? (
              <FeedPost key={item.data.id} post={item.data} />
            ) : (
              <BibleReadingFeedCard
                key={item.data.id}
                post={item.data}
                authorPosts={
                  biblePostsByAuthor[item.data.memberId || item.data.memberNickName] ?? [
                    item.data,
                  ]
                }
              />
            ),
          )
        : posts.map((post) => {
            return <FeedPost key={post.id} post={post} />;
          })}

      <div ref={loaderRef}></div>

      {isFetchingNextPage && (
        <div className="w-full flex my-2 justify-center">
          <LoadingIcon color="text-theme" />
        </div>
      )}
    </div>
  );
}
