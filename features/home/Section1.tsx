"use client";

import HomeHeader from "@/features/home/HomeHeader";
import { LoadingIcon } from "@/components/Icons";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { PostsData } from "@/types/responses";
import HomePost from "@/features/home/Post";
import { getFirstPage } from "@/features/post/firstPost";
import PostSkeleton from "./PostSkeleton";
import { User } from "@/types/User";

export default function HomeSection1() {
  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("network error");
      }
      return (await res.json()).data as User;
    },
  });
  async function fetchPosts(pageParam: number = 0) {
    const response = await fetch(`/api/home?pageParam=${pageParam}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch");
    const json = await response.json();

    const contentWithCheerings = await Promise.all(
      json.content.map(async (post: any) => {
        const cheeringsRes = await fetch(`/api/cheerings?postId=${post.id}`);
        const cheeringsJson = await cheeringsRes.json();
        return { ...post, cheerings: cheeringsJson.data.content };
      })
    );

    return {
      ...json,
      content: contentWithCheerings,
    } as PostsData;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["home"],
      queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage: PostsData) => {
        if (lastPage.last) return undefined;
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
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

  const posts = data?.pages.flatMap((p: PostsData) => p.content) ?? [];

  return (
    <>
      <HomeHeader />
      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
        // <div className="w-full flex justify-center">
        //   <LoadingIcon color="text-theme" />
        // </div>
      )}
      {posts.length === 0 && !isLoading && <HomePost post={getFirstPage()} currentUser={currentUser} />}
      <div className="flex flex-col gap-7 pb-15">
        {posts.map((post: PostRes) => {
          return (
            <HomePost key={post.id} post={post} currentUser={currentUser} />
          );
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
