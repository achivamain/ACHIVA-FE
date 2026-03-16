"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/User";
import { categories, type Category } from "@/types/Categories";
import { SearchIcon, CloseIcon } from "@/components/Icons";

export type Moim = {
  id: number;
  name: string;
  description: string;
  categories: Category[];
  leaderName: string;
  memberCount: number;
  maxMember: number;
  isPrivate: boolean;
  isOfficial: boolean;
};


export default function MoimExplorePage() {
  const router = useRouter();

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
  const displayedCategories = categoryTab === "MY" && myCategories.length > 0 
                              ? categories.filter(c => myCategories.includes(c)) 
                              : categories;

  const toggleCategory = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== cat));
    } else {
      setSelectedCategories((prev) => [...prev, cat]);
    }
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
    queryKey: ["moims", debouncedSearch, selectedCategories, categoryTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("keyword", debouncedSearch);
      
      const catsToFetch = displayedCategories;
      if (categoryTab === "MY" && catsToFetch.length > 0 && !debouncedSearch) {
        catsToFetch.forEach(c => params.append("categories", c));
      } else if (selectedCategories.length > 0 && !debouncedSearch) {
        selectedCategories.forEach(c => params.append("categories", c));
      }
      
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
    <div className="flex flex-col h-full bg-white relative pb-20">
      {/* 헤더 */}
      <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 hidden lg:flex">
        <h1 className="text-xl font-bold text-theme">모임 탐색</h1>
      </header>
      
      {/* 모바일 헤더(상단 여백 용) */}
      <div className="pt-4 lg:hidden px-5">
         <h1 className="text-2xl font-bold text-theme">모임</h1>
      </div>

      <main className="flex-1 overflow-y-auto px-5 pt-4">
        {/* 검색창 */}
        <div className="relative mb-6">
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
              <span className="text-xs text-gray-400">{isLoading ? "검색 중..." : `${filteredMoims.length}개`}</span>
            </div>
            {isLoading ? (
              <div className="py-8 text-center text-gray-400">검색 중...</div>
            ) : filteredMoims.length === 0 ? (
              <div className="py-8 text-center text-gray-400">'{debouncedSearch}'에 대한 검색 결과가 없습니다.</div>
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
                        {moim.isPrivate && <span className="text-gray-400">🔒</span>}
                        {moim.isOfficial && <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-bold">OFFICIAL</span>}
                        {moim.name}
                      </h3>
                      <span className="text-xs text-gray-500">👤 {moim.memberCount}/{moim.maxMember}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{moim.description}</p>
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
                 <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">HOT</span>
               </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5 snap-x">
              {officialMoims.map((moim) => (
                <div 
                  key={moim.id} 
                  onClick={() => router.push(`/moim/${moim.id}`)}
                  className="snap-center relative min-w-[280px] w-[280px] h-[160px] rounded-2xl overflow-hidden shadow-md shrink-0 cursor-pointer group"
                >
                   <img src={"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop"} alt={moim.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 flex flex-col justify-end">
                      <span className="bg-theme text-white text-[10px] font-bold px-2 py-1 rounded w-max mb-2">OFFICIAL</span>
                      <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">{moim.name}</h3>
                      <p className="text-gray-200 text-xs line-clamp-2 mb-2">{moim.description}</p>
                      <div className="flex items-center text-white text-xs font-medium">
                         <span className="mr-1">👤</span> {moim.memberCount.toLocaleString()}명 참여 중
                      </div>
                   </div>
                </div>
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
                 <span className="bg-theme/10 text-theme text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">{myMoims.length}</span>
               </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5 snap-x">
              {myMoims.map((moim) => (
                <div 
                  key={moim.id} 
                  onClick={() => router.push(`/moim/${moim.id}`)}
                  className="snap-center relative min-w-[280px] w-[280px] h-[160px] rounded-2xl overflow-hidden shadow-md shrink-0 cursor-pointer group bg-gray-900 border border-gray-800"
                >
                   <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-gray-900 via-gray-800 to-gray-700">
                      <div className="flex justify-between items-start w-full">
                        <span className="bg-theme text-white border border-theme text-[10px] font-bold px-2 py-1 rounded w-max mb-2">MY CREW</span>
                        {moim.isPrivate && <span className="text-white/80 text-sm">🔒</span>}
                      </div>
                      <h3 className="text-white font-bold text-xl leading-tight mb-1 truncate">{moim.name}</h3>
                      <p className="text-gray-300 text-xs line-clamp-2 mb-3">{moim.description}</p>
                      <div className="flex justify-between items-center text-white text-xs font-medium">
                         <span className="flex items-center bg-gray-800/80 px-2 py-1 rounded-full"><span className="mr-1">👤</span> {moim.memberCount} / {moim.maxMember}</span>
                         <span className="bg-gray-800/80 px-2 py-1 rounded-full border border-gray-700">👑 {moim.leaderName}</span>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 구분선 ================= */}
        <div className="h-2 bg-gray-50 -mx-5 mb-8"></div>

        {/* 카테고리 필터 영역 - 검색 중엔 숨김 */}
        {!isSearching && <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-theme">크루 탐색</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => { setCategoryTab("MY"); setSelectedCategories([]); }}
                className={`text-xs px-3 py-1.5 rounded-md font-bold transition-colors ${categoryTab === "MY" ? "bg-white text-theme shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                나의 관심 종목
              </button>
              <button 
                onClick={() => { setCategoryTab("ALL"); setSelectedCategories([]); }}
                className={`text-xs px-3 py-1.5 rounded-md font-bold transition-colors ${categoryTab === "ALL" ? "bg-white text-theme shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                전체 종목
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {displayedCategories.length === 0 && categoryTab === "MY" ? (
               <div className="text-sm text-gray-400 py-1">관심 종목이 없습니다. 전체 종목을 확인해보세요!</div>
            ) : (
              displayedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
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
        </div>}

        {/* 모임 리스트 - 검색 중엔 숨김 */}
        {!isSearching && <div className="space-y-4">
          <div className="mb-2 flex justify-between items-center">
             <span className="text-gray-500 text-sm">총 {filteredMoims.length}개의 일반 모임</span>
          </div>
          
          {filteredMoims.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              조건에 맞는 모임이 없습니다.<br/>직접 첫 번째 모임을 만들어보세요!
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
                    {moim.isPrivate && <span className="text-gray-400">🔒</span>}
                    {moim.name}
                  </h3>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    👤 {moim.memberCount} / {moim.maxMember}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-3 text-xs text-gray-500 font-medium">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">👑 방장</span>
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
        </div>}
      </main>

      {/* 모임 만들기 FAB */}
      <Link 
        href={`/moim/create`}
        className="fixed bottom-[90px] lg:bottom-10 right-5 lg:right-[calc(50vw-450px+20px)] xl:right-[calc(50vw-450px+20px)] w-14 h-14 bg-theme text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-20"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </Link>
    </div>
  );
}
