"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Moim } from "@/types/moim";
import type { User } from "@/types/User";
import Banner from "@/features/event/Banner";
import { MyCrewCard } from "@/features/moim/moimCard";
import useDragScroll from "@/hooks/useDragScroll";
import Link from "next/link";

function MyMoimsSkeleton() {
  return (
    <div className="-mx-5 overflow-hidden px-5 pb-4">
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[160px] w-[280px] min-w-[280px] overflow-hidden rounded-2xl border border-[#F2DDE1] bg-[#FFF7F8] shadow-sm"
          >
            <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#FFF6F8_34%,#FFECEF_72%,#FFDADF_100%)] p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-5 w-28 rounded-full bg-white/80 animate-pulse" />
                  <div className="h-5 w-20 rounded-full bg-white/70 animate-pulse" />
                </div>
                <div className="h-7 w-16 rounded-full bg-white/75 ring-1 ring-[#F2DDE1] animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-white/70 animate-pulse" />
                <div className="h-4 w-3/4 rounded-full bg-white/60 animate-pulse" />
              </div>

              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="h-8 w-24 rounded-full bg-white/80 ring-1 ring-[#EEDADF] animate-pulse" />
                <div className="h-8 w-20 rounded-full bg-[#FFF0F3] ring-1 ring-[#F2B8C4]/35 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MoimListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="h-5 w-32 rounded-full bg-gray-100 animate-pulse" />
              <div className="h-4 w-16 rounded-full bg-gray-100 animate-pulse" />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="h-7 w-20 rounded-md bg-gray-100 animate-pulse" />
              <div className="h-7 w-24 rounded-md bg-gray-100 animate-pulse" />
            </div>
          </div>

          <div className="mb-3 h-4 w-24 rounded-full bg-gray-100 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-gray-100 animate-pulse" />
            <div className="h-4 w-2/3 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MoimExplorePage() {
  const router = useRouter();
  const {
    scrollRef: myMoimsScrollRef,
    isDragging: isMyMoimsDragging,
    dragProps: myMoimsDragProps,
    shouldSuppressClick: shouldSuppressMyMoimClick,
  } = useDragScroll<HTMLDivElement>();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/members/me");
      if (!res.ok) throw new Error("Failed to fetch current user");
      return (await res.json()).data as User;
    },
  });

  const {
    data: myMoimsData,
    isLoading: isMyMoimsLoading,
    isError: isMyMoimsError,
  } = useQuery({
    queryKey: ["myMoims"],
    queryFn: async () => {
      const res = await fetch("/api/moim/my");
      if (!res.ok) throw new Error("Failed to fetch my moims");
      return (await res.json()).data as Moim[];
    },
  });

  const {
    data: moimsData,
    isLoading: isMoimsLoading,
    isError: isMoimsError,
  } = useQuery({
    queryKey: ["moims"],
    queryFn: async () => {
      const res = await fetch("/api/moim");
      if (!res.ok) throw new Error("Failed to fetch moims");
      return (await res.json()).data.content as Moim[];
    },
  });

  const myMoims = myMoimsData || [];
  const moims = moimsData || [];

  const handleMyMoimClick = (moimId: number) => {
    if (shouldSuppressMyMoimClick()) return;
    router.push(`/moim/${moimId}`);
  };

  return (
    <div className="flex w-full flex-1">
      <div className="relative flex min-w-0 flex-1 flex-col bg-white pb-20">
        <header className="sticky top-0 z-10 hidden border-b border-gray-100 bg-white lg:flex">
          <div className="mx-auto flex h-[60px] w-full max-w-[844px] items-center px-5">
            {currentUser ? (
              <h1 className="text-xl font-bold text-theme">
                {currentUser.organizationName}
              </h1>
            ) : (
              <div className="h-7" />
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[844px] px-5 py-4">
            <div className="flex min-h-[48px] items-end pb-4 lg:hidden">
              {currentUser ? (
                <h1 className="text-2xl font-bold text-theme">
                  {currentUser.organizationName}
                </h1>
              ) : (
                <div className="h-8" />
              )}
            </div>

            {/* 테스트 완료 후 이 블록만 제거하면 생성 버튼이 함께 사라집니다.
            <div className="mb-8 flex justify-end">
              <Link
                href="/moim/create"
                className="inline-flex items-center gap-2 rounded-xl bg-theme px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#322020]"
              >
                <span className="text-base leading-none">+</span>
                구역 생성
              </Link>
            </div> */}

            <section className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-theme">
                  내가 가입한 구역
                </h2>
              </div>

              {isMyMoimsLoading ? (
                <MyMoimsSkeleton />
              ) : isMyMoimsError ? (
                <div className="flex min-h-[176px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-5 py-12 text-center text-sm text-red-500">
                  가입한 구역을 불러오지 못했습니다.
                </div>
              ) : myMoims.length === 0 ? (
                <div className="flex min-h-[176px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 px-5 py-12 text-center">
                  <span className="mb-2 text-3xl">🏃</span>
                  <p className="text-sm text-gray-500">
                    아직 참여 중인 구역이 없어요.
                  </p>
                </div>
              ) : (
                <div
                  ref={myMoimsScrollRef}
                  {...myMoimsDragProps}
                  className={`-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide select-none ${
                    isMyMoimsDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                >
                  {myMoims.map((moim) => (
                    <MyCrewCard
                      key={moim.id}
                      moim={moim}
                      onClick={() => handleMyMoimClick(moim.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <div className="-mx-5 mb-8 h-2 bg-gray-50" />

            <section className="space-y-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold text-theme">전체 구역</h2>
              </div>

              {isMoimsLoading ? (
                <MoimListSkeleton />
              ) : isMoimsError ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-5 py-12 text-center text-sm text-red-500">
                  전체 구역을 불러오지 못했습니다.
                </div>
              ) : moims.length === 0 ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center text-sm text-gray-400">
                  표시할 구역이 없습니다.
                </div>
              ) : (
                moims.map((moim) => {
                  const temp = Math.min(
                    100,
                    Math.max(36.5, 36.5 + 0.8 * (moim.score ?? 0)),
                  );

                  return (
                    <button
                      key={moim.id}
                      type="button"
                      onClick={() => router.push(`/moim/${moim.id}`)}
                      className="w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-theme">
                          {moim.isPrivate && (
                            <span className="text-gray-400">🔒</span>
                          )}
                          <span className="truncate">{moim.name}</span>
                        </h3>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-500">
                            🔥 {temp.toFixed(1)}°C
                          </span>
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            👤 {moim.memberCount} / {moim.maxMember}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-1 text-xs font-medium text-gray-500">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">
                          👑 관리자
                        </span>
                        {moim.leaderName === "방장없음" ? "-" : moim.leaderName}
                      </div>

                      <p className="line-clamp-2 text-sm text-gray-600">
                        {moim.description}
                      </p>
                    </button>
                  );
                })
              )}
            </section>
          </div>
        </main>

        <div className="pb-10 lg:hidden" />
      </div>

      <div className="hidden w-[320px] justify-center bg-[#fafafa] md:flex">
        <Banner />
      </div>
    </div>
  );
}
