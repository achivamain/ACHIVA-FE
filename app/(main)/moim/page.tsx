"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { Moim } from "@/types/moim";
import { SearchIcon, CloseIcon } from "@/components/Icons";
import { MyCrewCard, OfficialChallengeCard } from "@/features/moim/moimCard";
import Banner from "@/features/event/Banner";
import useDragScroll from "@/hooks/useDragScroll";

export default function MoimExplorePage() {
  const router = useRouter();
  const {
    scrollRef: officialMoimsScrollRef,
    isDragging: isOfficialMoimsDragging,
    dragProps: officialMoimsDragProps,
    shouldSuppressClick: shouldSuppressOfficialMoimClick,
  } = useDragScroll<HTMLDivElement>();
  const {
    scrollRef: myMoimsScrollRef,
    isDragging: isMyMoimsDragging,
    dragProps: myMoimsDragProps,
    shouldSuppressClick: shouldSuppressMyMoimClick,
  } = useDragScroll<HTMLDivElement>();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 검색창 디바운스 (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = debouncedSearch.length > 0;

  const handleOfficialMoimClick = (moimId: number) => {
    if (shouldSuppressOfficialMoimClick()) return;
    router.push(`/moim/${moimId}`);
  };

  const handleMyMoimClick = (moimId: number) => {
    if (shouldSuppressMyMoimClick()) return;
    router.push(`/moim/${moimId}`);
  };

  const { data: officialMoimsData } = useQuery({
    queryKey: ["officialMoims"],
    queryFn: async () => {
      const res = await fetch(`/api/moim?size=10&isOfficial=true`);
      if (!res.ok) throw new Error("Failed to fetch official moims");
      return (await res.json()).data.content as Moim[];
    },
  });

  const { data: moimsData, isLoading } = useQuery({
    queryKey: ["moims", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("keyword", debouncedSearch);

      const res = await fetch(`/api/moim?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch moims");
      return (await res.json()).data.content as Moim[];
    },
  });

  const { data: myMoimsData } = useQuery({
    queryKey: ["myMoims"],
    queryFn: async () => {
      const res = await fetch(`/api/moim/my`);
      if (!res.ok) throw new Error("Failed to fetch my moims");
      return (await res.json()).data as Moim[];
    },
  });

  const officialMoims = officialMoimsData || [];
  const filteredMoims = moimsData || [];
  const myMoims = myMoimsData || [];

  return (
    <div className="w-full flex-1 flex">
      <div className="min-w-0 flex-1 flex flex-col bg-white relative pb-20">
        {/* 헤더 */}
        <header className="border-b border-gray-100 sticky top-0 bg-white z-10 hidden lg:flex">
          <div className="mx-auto flex w-full max-w-[844px] items-center justify-between px-5 py-4">
            <h1 className="text-xl font-bold text-theme">모임 탐색</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[844px] px-5 pt-4">
            {/* 모바일 헤더(상단 여백 용) */}
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold text-theme">모임</h1>
            </div>

            {/* 검색창 */}
            <div className="relative mb-6 mt-4 lg:mt-0">
              <input
                type="text"
                placeholder="어떤 운동 모임을 찾으시나요?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-theme transition-colors shadow-sm"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">
                <SearchIcon />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 bg-gray-200 rounded-full p-0.5"
                >
                  <CloseIcon />
                </button>
              )}
            </div>

            {/* 검색 중일 때: 검색 결과를 최상단에 표시 */}
            {isSearching && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme flex items-center gap-2">
                    🔍 검색 결과
                  </h2>
                  <span className="text-xs text-gray-400">
                    {isLoading ? "검색 중..." : `${filteredMoims.length}개`}
                  </span>
                </div>
                {isLoading ? (
                  <div className="py-8 text-center text-gray-400">
                    검색 중...
                  </div>
                ) : filteredMoims.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    &apos;{debouncedSearch}&apos;에 대한 검색 결과가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMoims.map((moim) => (
                      <div
                        key={moim.id}
                        onClick={() => router.push(`/moim/${moim.id}`)}
                        className="p-4 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-theme flex items-center gap-1.5">
                            {moim.isPrivate && (
                              <span className="text-gray-400">🔒</span>
                            )}
                            {moim.isOfficial && (
                              <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-bold">
                                OFFICIAL
                              </span>
                            )}
                            {moim.name}
                          </h3>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-3 h-3"
                            >
                              <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                            </svg>
                            {moim.memberCount}
                            {!moim.isOfficial && `/${moim.maxMember}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {moim.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 공식 챌린지 모임 (가로 슬라이드) - 검색 중엔 숨김 */}
            {!isSearching && officialMoims.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme flex items-center gap-2">
                    🔥 공식 챌린지
                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                      HOT
                    </span>
                  </h2>
                </div>
                <div
                  ref={officialMoimsScrollRef}
                  {...officialMoimsDragProps}
                  className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5 select-none ${
                    isOfficialMoimsDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                >
                  {officialMoims.map((moim) => (
                    <OfficialChallengeCard
                      key={moim.id}
                      moim={moim}
                      onClick={() => handleOfficialMoimClick(moim.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* 나의 크루 (가로 슬라이드) - 검색 중엔 숨김 */}
            {!isSearching && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h2 className="text-lg font-bold text-theme flex items-center gap-2">
                      🏃 나의 크루
                      <span className="bg-theme/10 text-theme text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                        {myMoims.length}
                      </span>
                    </h2>
                  </div>
                  <Link
                    href="/moim/create"
                    className="flex items-center gap-1 bg-theme/10 text-theme text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-theme hover:text-white transition-colors"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    새로 만들기
                  </Link>
                </div>

                {myMoims.length > 0 ? (
                  <div
                    ref={myMoimsScrollRef}
                    {...myMoimsDragProps}
                    className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5 select-none ${
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
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-3xl mb-2">🏃‍♀️</span>
                    <p className="text-gray-500 text-sm">
                      아직 소속된 크루가 없어요.
                      <br />
                      새로운 크루를 만들어보세요!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ================= 구분선 ================= */}
            <div className="h-2 bg-gray-50 -mx-5 mb-8"></div>

            {/* 모임 리스트 - 검색 중엔 숨김 */}
            {!isSearching && (
              <div className="space-y-4">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    총 {filteredMoims.length}개의 일반 모임
                  </span>
                </div>

                {filteredMoims.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    조건에 맞는 모임이 없습니다.
                    <br />
                    직접 첫 번째 모임을 만들어보세요!
                  </div>
                ) : (
                  filteredMoims.map((moim) => {
                    const temp = Math.min(
                      100,
                      Math.max(36.5, 36.5 + 0.8 * (moim.score ?? 0)),
                    );
                    return (
                    <div
                      key={moim.id}
                      onClick={() => router.push(`/moim/${moim.id}`)}
                      className="p-5 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-theme flex items-center gap-2">
                          {moim.isPrivate && (
                            <span className="text-gray-400">🔒</span>
                          )}
                          {moim.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            🔥 {temp.toFixed(1)}°C
                          </span>
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                            👤 {moim.memberCount} / {moim.maxMember}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-3 text-xs text-gray-500 font-medium">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                          👑 방장
                        </span>
                        {moim.isOfficial ? "나오운" : moim.leaderName}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {moim.description}
                      </p>
                    </div>
                  );
                  })
                )}
              </div>
            )}
          </div>
        </main>

        <div className="lg:hidden pb-10"></div>
      </div>
      <div className="bg-[#fafafa] w-[320px] hidden md:flex justify-center">
        <Banner />
      </div>
    </div>
  );
}
