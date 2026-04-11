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
            className="h-[168px] w-[292px] min-w-[292px] overflow-hidden rounded-[24px] border border-[#E9D9C9] bg-[#FFFDF9] shadow-sm"
          >
            <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top_left,#FFFFFF_0%,#FFF8EE_34%,#F8EBDD_68%,#EED8C0_100%)] p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-5 w-28 rounded-full bg-white/80 animate-pulse" />
                  <div className="h-5 w-20 rounded-full bg-white/70 animate-pulse" />
                </div>
                <div className="h-7 w-16 rounded-full bg-white/75 ring-1 ring-[#E9D9C9] animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-white/70 animate-pulse" />
                <div className="h-4 w-3/4 rounded-full bg-white/60 animate-pulse" />
              </div>

              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="h-8 w-24 rounded-full bg-white/80 ring-1 ring-[#E8DBCD] animate-pulse" />
                <div className="h-8 w-20 rounded-full bg-[#FFF3E5] ring-1 ring-[#E8C09B]/50 animate-pulse" />
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
          className="w-full rounded-[24px] border border-[#E9D9C9] bg-[#FFFCF8] p-5 shadow-[0_8px_24px_rgba(120,82,48,0.06)]"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="h-5 w-32 rounded-full bg-[#F5EADF] animate-pulse" />
              <div className="h-4 w-16 rounded-full bg-[#F5EADF] animate-pulse" />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="h-7 w-20 rounded-full bg-[#FFF3E5] animate-pulse" />
              <div className="h-7 w-24 rounded-full bg-[#F6EEE4] animate-pulse" />
            </div>
          </div>

          <div className="mb-3 h-4 w-24 rounded-full bg-[#F5EADF] animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full bg-[#F5EADF] animate-pulse" />
            <div className="h-4 w-2/3 rounded-full bg-[#F5EADF] animate-pulse" />
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
      <div className="relative flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#FFFDF9_0%,#FCF8F2_100%)] pb-20">
        <header className="sticky top-0 z-10 hidden border-b border-[#EEE2D5] bg-[rgba(255,252,248,0.92)] backdrop-blur lg:flex">
          <div className="mx-auto flex h-[60px] w-full max-w-[844px] items-center px-5">
            {currentUser ? (
              <h1 className="text-xl font-extrabold tracking-[-0.03em] text-[#4A2F20]">
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
                <h1 className="text-[28px] font-extrabold tracking-[-0.04em] text-[#4A2F20]">
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
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
                    My Grace Crew
                  </p>
                  <h2 className="text-lg font-extrabold tracking-[-0.03em] text-[#4A2F20]">
                    내가 가입한 구역
                  </h2>
                </div>
              </div>

              {isMyMoimsLoading ? (
                <MyMoimsSkeleton />
              ) : isMyMoimsError ? (
                <div className="flex min-h-[176px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-5 py-12 text-center text-sm text-red-500">
                  가입한 구역을 불러오지 못했습니다.
                </div>
              ) : myMoims.length === 0 ? (
              <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#EDE5DA] bg-white/70 px-5 py-10 text-center">
                <span className="text-3xl">🤝</span>
                <p className="text-sm text-[#9A8272]">아직 참여 중인 구역이 없어요.</p>
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

            <div className="-mx-5 mb-8 h-2 bg-[#F4ECE3]" />

            <section className="space-y-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D96B2B]">
                    Explore
                  </p>
                  <h2 className="text-lg font-extrabold tracking-[-0.03em] text-[#4A2F20]">
                    전체 구역
                  </h2>
                </div>
              </div>

              {isMoimsLoading ? (
                <MoimListSkeleton />
              ) : isMoimsError ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-5 py-12 text-center text-sm text-red-500">
                  전체 구역을 불러오지 못했습니다.
                </div>
              ) : moims.length === 0 ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-[24px] border border-[#E9D9C9] bg-[#FFFDF9] px-5 py-12 text-center text-sm text-[#A28E7D] shadow-[0_8px_24px_rgba(120,82,48,0.05)]">
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
                      className="group w-full overflow-hidden rounded-2xl border border-[#EDE5DA] bg-white text-left shadow-[0_2px_16px_rgba(160,120,80,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(160,120,80,0.13)]"
                    >
                      <div className="flex items-stretch">
                        <div className="w-1 shrink-0 rounded-l-2xl bg-gradient-to-b from-[#F5A96B] to-[#D96030]" />
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="flex items-center gap-1.5 text-[17px] font-bold tracking-tight text-[#3A2418]">
                                {moim.isPrivate && (
                                  <span className="text-sm text-[#C8A080]">🔒</span>
                                )}
                                <span className="truncate">{moim.name}</span>
                              </h3>
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#B09478]">
                                <span>👑</span>
                                <span>{moim.leaderName === "방장없음" ? "방장 없음" : moim.leaderName}</span>
                                <span className="mx-0.5 opacity-40">·</span>
                                <span>멤버 {moim.memberCount}명</span>
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#FFF5EC] px-3 py-1.5 text-[12px] font-bold text-[#D06530] ring-1 ring-[#F2C89A]/70">
                              🔥 {temp.toFixed(1)}°C
                            </span>
                          </div>
                          <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-[#8A7060]">
                            {moim.description || "함께 은혜를 나누는 공동체입니다."}
                          </p>
                        </div>
                      </div>
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
