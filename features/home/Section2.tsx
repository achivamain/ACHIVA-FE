"use client";

import { HomeSectionHeader } from "./HomeHeader";
import { LoadingIcon } from "@/components/Icons";
import { useInfiniteQuery, useIsFetching } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { PostsData } from "@/types/responses";
import HomePost from "@/features/home/Post";
import { useSession } from "next-auth/react";
import { postsBookIdCache } from "../post/PostsBookIdCache";

export default function HomeSection2() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // 첫번째 섹션이 우선적으로 로딩되도록
  const isFetchingFirstSection =
    useIsFetching({
      queryKey: ["home"],
    }) > 0;

  async function fetchPosts(pageParam: number = 0) {
    const response = await fetch(
      `/api/members/feed?id=${currentUserId}&pageParam=${pageParam}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch");
    const json = await response.json();

    const contentWithCheerings = await Promise.all(
      json.data.content.map(async (post: any) => {
        const cheeringsRes = await fetch(`/api/cheerings?postId=${post.id}`);
        const cheeringsJson = await cheeringsRes.json();
        return { ...post, cheerings: cheeringsJson.data.content };
      })
    );

    return {
      ...json.data,
      content: contentWithCheerings,
    } as PostsData;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["feed"],
      queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined; // 더 없음
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
      enabled: !!currentUserId && !isFetchingFirstSection, // id가 없으면 query 실행 안 함
    });

  // 센티넬 IO
  const loaderRef = useRef(null);
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
    <>
      <HomeSectionHeader>관심있는 성취 카테고리 이야기</HomeSectionHeader>
      {isLoading && (
        <div className="w-full flex justify-center">
          <LoadingIcon color="text-theme" />
        </div>
      )}
      <div className="flex flex-col gap-7">
        {posts.map((post) => {
          if (post.bookArticle)
            postsBookIdCache.set(post.id, post.bookArticle[0]); // 세부 페이지에서 책 정보를 띄우기 위한 임시방편)
          return <HomePost key={post.id} post={post} />;
        })}
      </div>
      <div ref={loaderRef}></div>
      {isFetchingNextPage && (
        <div className="w-full flex my-2 justify-center">
          <LoadingIcon color="text-theme" />
        </div>
      )}
    </>
  );
}
