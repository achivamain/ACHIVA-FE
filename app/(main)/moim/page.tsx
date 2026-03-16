"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/User";
import type { Moim } from "@/types/moim";
import { categories, type Category } from "@/types/Categories";
import { SearchIcon, CloseIcon } from "@/components/Icons";
import { MyCrewCard, OfficialChallengeCard } from "@/features/moim/moimCard";
import Banner from "@/features/event/Banner";
import useDragScroll from "@/hooks/useDragScroll";

const dummyMoims: Moim[] = [
  {
    id: 1001,
    name: "새벽 러닝 크루 5AM",
    description:
      "출근 전 가볍게 뛰는 아침 러너 모임입니다. 주 3회 한강 러닝을 진행합니다.",
    categories: ["러닝", "걷기"],
    leaderName: "민준",
    memberCount: 18,
    maxMember: 30,
    isPrivate: false,
    isOfficial: true,
  },
  {
    id: 1002,
    name: "주말 풋살 한판",
    description:
      "토요일 오전마다 모여 풋살 경기와 친선전을 즐기는 소규모 크루입니다.",
    categories: ["풋살"],
    leaderName: "서연",
    memberCount: 12,
    maxMember: 20,
    isPrivate: false,
    isOfficial: false,
  },
  {
    id: 1003,
    name: "클라이밍 입문자 모임",
    description:
      "볼더링이 처음이어도 괜찮습니다. 장비 정보부터 기본 동작까지 함께 익혀요.",
    categories: ["클라이밍"],
    leaderName: "도윤",
    memberCount: 9,
    maxMember: 15,
    isPrivate: true,
    isOfficial: false,
  },
  {
    id: 1004,
    name: "오피셜 여름 바디 챌린지",
    description:
      "8주 동안 인증과 운동 루틴을 함께 달성하는 시즌형 공식 챌린지입니다.",
    categories: ["헬스", "러닝"],
    leaderName: "ACHIVA",
    memberCount: 142,
    maxMember: 300,
    isPrivate: false,
    isOfficial: true,
  },
  {
    id: 1005,
    name: "퇴근 후 요가&필라테스",
    description:
      "저녁 시간대에 모여 스트레칭과 코어 운동 중심으로 진행하는 힐링 모임입니다.",
    categories: ["요가", "필라테스"],
    leaderName: "지우",
    memberCount: 14,
    maxMember: 24,
    isPrivate: false,
    isOfficial: false,
  },
];

const dummyMyMoimIds = [1002, 1003];

const createMoimFabIcon = (
  <svg
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
    stroke="currentColor"
    className="w-7 h-7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

function getFallbackMoims(keyword: string, selected: readonly Category[]) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return dummyMoims.filter((moim) => {
    const matchesKeyword =
      !normalizedKeyword ||
      moim.name.toLowerCase().includes(normalizedKeyword) ||
      moim.description.toLowerCase().includes(normalizedKeyword) ||
      moim.leaderName.toLowerCase().includes(normalizedKeyword);

    const matchesCategory =
      selected.length === 0 ||
      selected.some((category) => moim.categories.includes(category));

    return matchesKeyword && matchesCategory;
  });
}

export default function MoimExplorePage() {
  const router = useRouter();
  const {
    scrollRef: categoryScrollRef,
    isDragging: isCategoryDragging,
    onMouseDown: handleCategoryMouseDown,
    shouldSuppressClick,
  } = useDragScroll<HTMLDivElement>();

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryTab, setCategoryTab] = useState<"MY" | "ALL">("MY");

  // 검색창 디바운스 (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isSearching = debouncedSearch.length > 0;

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me`, { method: "GET" });
      if (!res.ok) throw new Error("network error");
      return (await res.json()).data as User;
    },
    staleTime: 5 * 1000,
  });

  const myCategories = (user?.categories || []) as Category[];
  const displayedCategories =
    categoryTab === "MY" && myCategories.length > 0
      ? categories.filter((c) => myCategories.includes(c))
      : categories;

  const toggleCategory = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== cat));
    } else {
      setSelectedCategories((prev) => [...prev, cat]);
    }
  };

  const handleCategoryClick = (cat: Category) => {
    if (shouldSuppressClick()) return;
    toggleCategory(cat);
  };

  const { data: officialMoimsData } = useQuery({
    queryKey: ["officialMoims"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/moim?size=10&isOfficial=true`);
        if (!res.ok) throw new Error("Failed to fetch official moims");
        const data = (await res.json()).data.content as Moim[];
        return data.length > 0
          ? data
          : dummyMoims.filter((moim) => moim.isOfficial);
      } catch {
        return dummyMoims.filter((moim) => moim.isOfficial);
      }
    },
    retry: false,
  });

  const { data: moimsData, isLoading } = useQuery({
    queryKey: ["moims", debouncedSearch, selectedCategories, categoryTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("keyword", debouncedSearch);

      const catsToFetch = displayedCategories;
      if (categoryTab === "MY" && catsToFetch.length > 0 && !debouncedSearch) {
        catsToFetch.forEach((c) => params.append("categories", c));
      } else if (selectedCategories.length > 0 && !debouncedSearch) {
        selectedCategories.forEach((c) => params.append("categories", c));
      }

      const fallbackCategories =
        categoryTab === "MY" && catsToFetch.length > 0 && !debouncedSearch
          ? catsToFetch
          : selectedCategories;

      try {
        const res = await fetch(`/api/moim?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch moims");
        const data = (await res.json()).data.content as Moim[];
        return data.length > 0
          ? data
          : getFallbackMoims(debouncedSearch, fallbackCategories);
      } catch {
        return getFallbackMoims(debouncedSearch, fallbackCategories);
      }
    },
    retry: false,
  });

  const { data: myMoimsData } = useQuery({
    queryKey: ["myMoims"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/moim/my`);
        if (!res.ok) throw new Error("Failed to fetch my moims");
        const data = (await res.json()).data as Moim[];
        return data.length > 0
          ? data
          : dummyMoims.filter((moim) => dummyMyMoimIds.includes(moim.id));
      } catch {
        return dummyMoims.filter((moim) => dummyMyMoimIds.includes(moim.id));
      }
    },
    retry: false,
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
                <div className="py-8 text-center text-gray-400">검색 중...</div>
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
                        <span className="text-xs text-gray-500">
                          👤 {moim.memberCount}/{moim.maxMember}
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
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5 snap-x">
                {officialMoims.map((moim) => (
                  <OfficialChallengeCard
                    key={moim.id}
                    moim={moim}
                    onClick={() => router.push(`/moim/${moim.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
          {/* 나의 크루 (가로 슬라이드) - 검색 중엔 숨김 */}
          {!isSearching && myMoims.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-theme flex items-center gap-2">
                  🏃 나의 크루
                  <span className="bg-theme/10 text-theme text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                    {myMoims.length}
                  </span>
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5 snap-x">
                {myMoims.map((moim) => (
                  <MyCrewCard
                    key={moim.id}
                    moim={moim}
                    onClick={() => router.push(`/moim/${moim.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ================= 구분선 ================= */}
          <div className="h-2 bg-gray-50 -mx-5 mb-8"></div>

          {/* 카테고리 필터 영역 - 검색 중엔 숨김 */}
          {!isSearching && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-theme">크루 탐색</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => {
                      setCategoryTab("MY");
                      setSelectedCategories([]);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-md font-bold transition-colors ${categoryTab === "MY" ? "bg-white text-theme shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    나의 관심 종목
                  </button>
                  <button
                    onClick={() => {
                      setCategoryTab("ALL");
                      setSelectedCategories([]);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-md font-bold transition-colors ${categoryTab === "ALL" ? "bg-white text-theme shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    전체 종목
                  </button>
                </div>
              </div>

              <div
                ref={categoryScrollRef}
                onMouseDown={handleCategoryMouseDown}
                className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide select-none ${
                  isCategoryDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                {displayedCategories.length === 0 && categoryTab === "MY" ? (
                  <div className="text-sm text-gray-400 py-1">
                    관심 종목이 없습니다. 전체 종목을 확인해보세요!
                  </div>
                ) : (
                  displayedCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex-shrink-0 ${
                        selectedCategories.includes(cat)
                          ? "bg-theme text-white border-theme"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

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
                filteredMoims.map((moim) => (
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
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        👤 {moim.memberCount} / {moim.maxMember}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-3 text-xs text-gray-500 font-medium">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                        👑 방장
                      </span>
                      {moim.leaderName}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {moim.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {moim.categories.map((cat) => (
                        <span
                          key={cat}
                          className="text-[11px] bg-theme/5 text-theme border border-theme/20 px-2 py-0.5 rounded-full font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          </div>
        </main>

        <div className="lg:hidden pb-10"></div>
        {/* 모임 만들기 FAB */}
        <Link
          href={`/moim/create`}
          className="fixed bottom-[110px] right-5 w-14 h-14 bg-theme text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-20 md:hidden"
        >
          {createMoimFabIcon}
        </Link>
        <div className="pointer-events-none fixed bottom-10 left-20 right-[320px] z-20 hidden md:block lg:left-60">
          <div className="mx-auto flex w-full max-w-[844px] justify-end px-5">
            <Link
              href={`/moim/create`}
              className="pointer-events-auto w-14 h-14 bg-theme text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              {createMoimFabIcon}
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-[#fafafa] w-[320px] hidden md:flex justify-center">
        <Banner />
      </div>
    </div>
  );
}
