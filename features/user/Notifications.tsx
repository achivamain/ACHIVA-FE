"use client";

import { LoadingIcon } from "@/components/Icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { PostRes } from "@/types/Post";
import type { NotificationsRes } from "@/types/responses";
import ProfileImg from "@/components/ProfileImg";
import dateFormatter from "@/lib/dateFormatter";
import { cheeringMeta } from "../post/cheeringMeta";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postsBookIdCache } from "@/features/post/PostsBookIdCache"

// 포스트 캐시
const postCache = new Map<string, PostRes | undefined>();

export default function Notifications() {
  const router = useRouter();
  useEffect(() => {
    router.refresh(); // 현재 라우트의 서버 데이터 다시 가져오기
  }, [router]);

  async function fetchNotifications(pageParam: number = 0) {
    const response = await fetch(
      `/api/members/cheerings?pageParam=${pageParam}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch");
    const json = await response.json();

    await Promise.all(
      json.data.content.map(async (notification: any) => {
        if (!postCache.has(notification.articleId)) {
          postCache.set(notification.articleId, undefined);
          const postRes = await fetch(
            `/api/posts?postId=${notification.articleId}`
          );
          const postJson = await postRes.json();
          postCache.set(notification.articleId, postJson.data);
          return postJson;
        }
      })
    );

    return json.data as NotificationsRes;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: ({ pageParam = 0 }) => fetchNotifications(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined; // 더 없음
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

  const notifications = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <div className="flex-1">
      {isLoading && (
        <div className="divide-y divide-black/15">
          {Array(10)
            .fill(0)
            .map((_, idx) => (
              <NotificationSkeleton key={idx} />
            ))}
        </div>
      )}
      {notifications.length === 0 && !isLoading && (
        <p className="h-full flex justify-center items-center text-[#808080]">
          아직 받은 응원이 없어요.
        </p>
      )}
      <ul className="w-full flex flex-col">
        {notifications.map((n, idx) => {
          const Icon = cheeringMeta[n.cheeringCategory].icon;
          const color = cheeringMeta[n.cheeringCategory].color;
          const hasTitle =
            idx === 0 ||
            notifications[idx - 1].articleId !== notifications[idx].articleId;
          return (
            <div key={n.id}>
              {hasTitle && (
                <Link
                  href={`/post/${n.articleId}`}
                  className={`flex items-center gap-3 ${
                    idx === 0 ? "" : "mt-5"
                  } mb-3`}
                >
                  {/*책 제목이 로딩되지 않았다면 카테고리를 띄움*/}
                  <div className="font-semibold text-xl bg-theme text-white rounded-sm px-4 py-1.5">
                    {postCache.get(n.articleId)?.bookArticle[0]?.bookTitle ||
                      postsBookIdCache.get(n.articleId)?.bookTitle ||
                      postCache.get(n.articleId)?.category}
                  </div>
                  <p className="text-[#808080] font-light">
                    {postCache.get(n.articleId)?.authorCategorySeq}번째 이야기
                  </p>
                  <button className="ml-auto">
                    <svg
                      width="25"
                      height="26"
                      viewBox="0 0 25 26"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.82165 5.74029C8.74907 5.6677 8.69149 5.58153 8.6522 5.48669C8.61292 5.39185 8.5927 5.2902 8.5927 5.18755C8.5927 5.0849 8.61292 4.98325 8.6522 4.88841C8.69149 4.79358 8.74907 4.7074 8.82165 4.63482C8.89424 4.56223 8.98041 4.50465 9.07525 4.46537C9.17009 4.42609 9.27173 4.40587 9.37439 4.40587C9.47704 4.40587 9.57869 4.42609 9.67352 4.46537C9.76836 4.50465 9.85453 4.56223 9.92712 4.63482L17.7396 12.4473C17.8123 12.5199 17.8699 12.606 17.9092 12.7009C17.9485 12.7957 17.9688 12.8974 17.9688 13.0001C17.9688 13.1027 17.9485 13.2044 17.9092 13.2992C17.8699 13.3941 17.8123 13.4802 17.7396 13.5528L9.92712 21.3653C9.78053 21.5119 9.5817 21.5942 9.37439 21.5942C9.16707 21.5942 8.96825 21.5119 8.82165 21.3653C8.67506 21.2187 8.5927 21.0199 8.5927 20.8126C8.5927 20.6052 8.67506 20.4064 8.82165 20.2598L16.0824 13.0001L8.82165 5.74029Z"
                        fill="#B3B3B3"
                      />
                    </svg>
                  </button>
                </Link>
              )}

              <li
                className={`flex gap-2.5 items-center py-2 ${
                  hasTitle ? "" : "border-t border-t-black/15"
                }`}
              >
                <Link href={`/${n.senderName}`}>
                  <ProfileImg url={n.senderProfileImageUrl} size={50} />
                </Link>
                <div className="flex-1 flex gap-2.5 items-center">
                  <Link href={`/${n.senderName}`} className="font-semibold">
                    {n.senderName}
                  </Link>
                  <p className="font-light text-black/50">
                    {dateFormatter(n.createdAt)}
                  </p>
                  {/* 응원 버튼 */}
                  <div
                    style={{ backgroundColor: color, borderColor: color }}
                    className="ml-auto text-[15px] sm:text-base flex items-center gap-[2px] sm:gap-1 rounded-full border px-3 py-1 text-white"
                  >
                    <p>{n.cheeringCategory}</p>
                    <Icon active />
                  </div>
                </div>
              </li>
            </div>
          );
        })}
      </ul>
      <div ref={loaderRef}></div>
      {isFetchingNextPage && (
        <div className="w-full flex my-2 justify-center">
          <LoadingIcon color="text-theme" />
        </div>
      )}
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <li className={`flex gap-2.5 items-center py-2`}>
      <div className="w-[50px] rounded-full aspect-square bg-loading animate-pulse" />
      <div className="flex-1 flex gap-2.5 items-center">
        <div className="h-6 w-40 bg-loading animate-pulse rounded-md" />
      </div>
    </li>
  );
}
