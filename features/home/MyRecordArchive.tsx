"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { LoadingIcon } from "@/components/Icons";
import { inter } from "@/lib/fonts";
import type { PostRes } from "@/types/Post";
import type { PostsData } from "@/types/responses";
import Link from "next/link";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

export default function MyRecordArchive({ userId }: { userId: string }) {
  async function fetchArticles(pageParam: number = 0): Promise<PostsData> {
    const response = await fetch(
      `/api/members/getPosts?id=${userId}&pageParam=${pageParam}&sort=DESC&size=10`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("Failed to fetch");
    const json = await response.json();
    return json.data as PostsData;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["recordArchive", userId],
      queryFn: ({ pageParam = 0 }) => fetchArticles(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined;
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
    });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts: PostRes[] =
    data?.pages.flatMap((page) => page.content) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingIcon size="size-8" color="text-gray-400" />
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="px-5">
        <div className="sm:w-[768px]">
          <h2 className="text-[26px] font-semibold leading-[31px] text-black mb-4">
            나의 기록 보관소
          </h2>
          <p className="text-[#8E95A9] text-[15px]">
            아직 작성한 기록이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5">
      <div className="sm:w-[768px]">
      <h2 className="text-[26px] font-semibold leading-[31px] text-black mb-4">
        나의 기록 보관소
      </h2>
      <div className="flex flex-col gap-3">
        {allPosts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <div
              className="w-full rounded-[16px] bg-white border border-[#F3F4F6]
              shadow-[4px_4px_20px_rgba(51,38,174,0.04)]
              pt-[18px] pb-[18px] px-[14px]
              hover:shadow-[4px_4px_20px_rgba(51,38,174,0.10)] hover:-translate-y-0.5
              transition-all duration-200 cursor-pointer"
            >
              {/* 카테고리, 날짜 */}
              <div className="flex items-center gap-[15px]">
                <span
                  className="inline-flex items-center justify-center
                  h-[28px] px-[12px] bg-white border border-[#D9D9D9] rounded-[50px]
                  font-semibold text-[18px] leading-[21px] text-[#412A2A]"
                >
                  {post.category}
                </span>
                <span
                  className={`font-medium text-[14px] leading-[22px] text-[#8E95A9] ${inter.className}`}
                >
                  {formatDate(post.createdAt)}
                </span>
              </div>

              {/* 본문 */}
              <h3 className="mt-[26px] ml-[7px] font-semibold text-[20px] leading-[24px] text-[#45292B]">
                {post.title}
              </h3>

              {post.question?.map((q, idx) => (
                <div key={idx} className={idx === 0 ? "mt-[26px]" : "mt-[20px]"}>
                  <span
                    className="inline-flex items-center justify-center
                    h-[26px] px-[12px] bg-[#F9FAFB] rounded-[10px]
                    font-bold text-[13px] leading-[16px] text-[#9EA7B4]"
                  >
                    {q.question}
                  </span>
                  {q.content && (
                    <p
                      className={`mt-[6px] ml-[7px] font-medium text-[15px] leading-[22px] text-[#1C2A53] whitespace-pre-wrap ${inter.className}`}
                    >
                      {q.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      <div ref={observerRef} className="h-10" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <LoadingIcon size="size-6" color="text-gray-400" />
        </div>
      )}
      </div>
    </div>
  );
}

