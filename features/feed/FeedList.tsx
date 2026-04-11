"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LoadingIcon } from "@/components/Icons";
import type { PostRes, ScriptureReadingPostRes } from "@/types/Post";
import type { PostsData } from "@/types/responses";
import type { FeedTab } from "./FeedTabs";
import FeedPost from "./FeedPost";
import BibleReadingFeedList from "@/features/bible/BibleReadingFeedList";
import { isScriptureReadingPost } from "@/features/bible/selectors";

type FeedListProps = {
  activeTab: FeedTab;
};

export default function FeedList({ activeTab }: FeedListProps) {
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

    const contentWithCheerings = await Promise.all(
      (postsData.content ?? []).map(async (post: PostRes) => {
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
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined;
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
    });

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
  const scripturePosts = useMemo(
    () => posts.filter(isScriptureReadingPost) as ScriptureReadingPostRes[],
    [posts],
  );

  return (
    <div className="flex flex-col gap-7">
      {isLoading && (
        <div className="w-full flex justify-center py-10">
          <LoadingIcon color="text-theme" />
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#7f7f7f]">
          <p>표시할 게시글이 없습니다</p>
        </div>
      )}

      {!isLoading &&
        (activeTab === "성경 일독" ? (
          <BibleReadingFeedList posts={scripturePosts} />
        ) : (
          posts.map((post) => <FeedPost key={post.id} post={post} />)
        ))}

      <div ref={loaderRef}></div>

      {isFetchingNextPage && (
        <div className="w-full flex my-2 justify-center">
          <LoadingIcon color="text-theme" />
        </div>
      )}
    </div>
  );
}
