"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { LoadingIcon } from "@/components/Icons";
import { inter } from "@/lib/fonts";
import type { PostRes } from "@/types/Post";
import type { PostsData } from "@/types/responses";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";

function formatDateDisplay(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

export default function MyRecordArchive({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedDate = searchParams.get("date");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [shouldFetch, setShouldFetch] = useState(Boolean(selectedDate));

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
      enabled: shouldFetch,
    });

  useEffect(() => {
    if (selectedDate) {
      setShouldFetch(true);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (shouldFetch || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setShouldFetch(true);
        observer.disconnect();
      },
      { rootMargin: "1200px 0px" },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldFetch]);

  useEffect(() => {
    if (!shouldFetch || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "1500px 0px" },
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, shouldFetch]);

  const allPosts: PostRes[] = data?.pages.flatMap((page) => page.content) ?? [];

  const filteredPosts = selectedDate
    ? allPosts.filter((post) => {
        const postDate = format(new Date(post.createdAt), "yyyy-MM-dd");
        return postDate === selectedDate;
      })
    : allPosts;

  const isFiltered = !!selectedDate;

  const clearFilter = () => {
    router.replace(pathname, { scroll: false });
  };

  if (!shouldFetch) {
    return (
      <div id="record-archive" ref={containerRef} className="px-5">
        <div className="sm:w-[768px] mx-auto py-10">
          <div className="h-[220px] rounded-[24px] bg-white/70 ring-1 ring-[#F0EBE3] shadow-[0_2px_20px_rgba(0,0,0,0.04)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div id="record-archive" className="flex justify-center py-10">
        <LoadingIcon size="size-8" color="text-gray-400" />
      </div>
    );
  }

  return (
    <div id="record-archive" ref={containerRef} className="px-5">
      <div className="sm:w-[768px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-black">
            {isFiltered ? `${selectedDate} 기록` : "나의 은혜 기록장"}
          </h2>
          {isFiltered && (
            <button
              onClick={clearFilter}
              className="text-[13px] font-semibold text-[#D96B2B] bg-[#FFF4EC] px-3 py-1.5 rounded-full ring-1 ring-[#D96B2B]/20 transition-all active:scale-95"
            >
              모든 기록 보기
            </button>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[#8E95A9] text-[15px]">
              {isFiltered
                ? "해당 날짜에 작성된 기록이 이 목록에 없습니다."
                : "아직 작성한 기록이 없습니다."}
            </p>
            {isFiltered && (
              <p className="text-[12px] text-[#9CA3AF] mt-2">
                더 예전 기록이라면 아래로 스크롤하여 더 불러올 수 있습니다.
              </p>
            )}
          </div>
        ) : (
            <div className="flex flex-col gap-6">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <div
                    className="w-full rounded-[24px] bg-white border border-[#F0EBE3]
                    shadow-[0_4px_20px_rgba(0,0,0,0.04)]
                    pt-[20px] pb-[20px] px-[20px]
                    hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1
                    transition-all duration-300 cursor-pointer ring-1 ring-[#F0EBE3]/50"
                  >
                    {/* 카테고리, 날짜 */}
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center justify-center
                        h-[26px] px-3 bg-[#F5F3F0] rounded-full
                        font-bold text-[12px] text-[#1A1A1A]"
                      >
                        {post.category}
                      </span>
                      <span
                        className={`font-semibold text-[13px] text-[#9CA3AF] ${inter.className}`}
                      >
                        {formatDateDisplay(post.createdAt)}
                      </span>
                    </div>

                    {/* 본문 */}
                    <h3 className="mt-2 font-bold text-[19px] leading-tight text-[#1A1A1A]">
                      {post.title}
                    </h3>

                    {post.question?.length ? (
                      <div className="mt-3 flex flex-col gap-3">
                        {post.question.map((questionItem, index) => {
                          const questionLabel =
                            questionItem?.question?.trim() || `은혜 기록 ${index + 1}`;

                          return (
                            <div key={`${post.id}-${index}`}>
                              <span
                                className="inline-flex items-center justify-center
                          h-[22px] px-2.5 bg-[#F5F3F0] rounded-[6px]
                          font-bold text-[11px] text-[#9CA3AF]"
                              >
                                {questionLabel}
                              </span>
                              {questionItem.content && (
                                <p
                                  className={`mt-2 font-medium text-[14px] leading-relaxed text-[#4B5563] ${inter.className}`}
                                >
                                  {questionItem.content}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
        )}

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
