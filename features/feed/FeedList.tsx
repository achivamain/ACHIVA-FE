"use client";

// 피드 페이지 리스트 전체적인 관리
import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { LoadingIcon } from "@/components/Icons";
import type { PostsData } from "@/types/responses";
import type { FeedTab } from "./FeedTabs";
import FeedPost from "./FeedPost";
import { postsBookIdCache } from "../post/PostsBookIdCache";

type FeedListProps = {
  activeTab: FeedTab;
};

export default function FeedList({ activeTab }: FeedListProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  async function fetchPosts(pageParam: number = 0): Promise<PostsData> {
    let url: string;

    switch (activeTab) {
      case "전체":
        url = `/api/feed?pageParam=${pageParam}`;
        break;
      case "관심":
        url = `/api/feed/interest?memberId=${currentUserId}&pageParam=${pageParam}`;
        break;
      case "응원":
        url = `/api/feed/cheering?pageParam=${pageParam}`;
        break;
      case "친구":
        url = `/api/feed/friends?pageParam=${pageParam}`;
        break;
      default:
        url = `/api/feed?pageParam=${pageParam}`;
    }

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
      })
    );

    return {
      ...postsData,
      content: contentWithCheerings,
    } as PostsData;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["feed", activeTab, currentUserId],
      queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined;
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
      enabled: !!currentUserId,
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
      { rootMargin: "100px 0px" }
    );
    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <div className="flex flex-col gap-4">
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

      {posts.map((post) => {
        if (post.bookArticle) {
          postsBookIdCache.set(post.id, post.bookArticle[0]);
        }
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
