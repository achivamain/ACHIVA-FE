"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/User";
import ProfileImg from "@/components/ProfileImg";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

// ── 타입 ──────────────────────────────────────────────
type RankTab = "전체" | "관심운동" | "크루";

type RankUser = {
  rank: number;
  memberId: number;
  nickName: string;
  profileImageUrl: string | null;
  postCount: number;
  weeklyCount: number;
  streakWeeks: number;
};

// ── 온도 계산 ──────────────────────────────────────────
function calcTemp(postCount: number): number {
  return 36.5 + 0.8 * postCount;
}

// ── 열정 티어 (50 / 75 / 100도 기준) ───────────────────────────────────────
type PassionTier = {
  name: string;     // 티어명
  emoji: string;    // 이모지
  color: string;    // 텍스트·수치 색상
  bg: string;       // 뱃지 배경
  border: string;   // 뱃지 테두리
};

function getPassionTier(temp: number): PassionTier {
  if (temp >= 100) return {
    name: "열정레전드", emoji: "🔥🔥🔥",
    color: "#EA580C", bg: "#FFF7ED", border: "#FDBA74",  // origin: orange-700 -> orange-600
  };
  if (temp >= 75) return {
    name: "열정왕", emoji: "🔥🔥",
    color: "#F97316", bg: "#FFF7ED", border: "#FDBA74",  // origin: orange-600 -> orange-500
  };
  if (temp >= 50) return {
    name: "열정러", emoji: "🔥",
    color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",  // amber-600
  };
  return {
    name: "불씨", emoji: "🌡️",
    color: "#9CA3AF", bg: "#F9FAFB", border: "#E5E7EB",  // gray-400
  };
}




// ── 랭킹 아이템 ─────────────────────────────────
function RankItem({
  user,
  isMe,
  index,
  categoryTitle,
  tabVariant,
}: {
  user: RankUser;
  isMe?: boolean;
  index: number;
  categoryTitle?: string;
  tabVariant: "overall" | "category";
}) {
  const temp = calcTemp(user.postCount);
  const tier = getPassionTier(temp);
  const rankText =
    user.rank === 1 ? "text-amber-500"
    : user.rank === 2 ? "text-slate-400"
    : user.rank === 3 ? "text-orange-400"
    : "text-gray-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-colors ${
        isMe
          ? "bg-orange-50/60 ring-1 ring-orange-200/60"
          : "hover:bg-gray-50/70"
      }`}
    >
      {/* 순위 */}
      <div className={`w-6 flex-shrink-0 text-center font-black text-[13px] ${rankText}`}>
        {user.rank}
      </div>

      {/* 프로필 (링/glow 없음) */}
      <div className="relative flex-shrink-0">
        <div className="rounded-full overflow-hidden">
          <ProfileImg url={user.profileImageUrl ?? undefined} size={40} />
        </div>
        {isMe && (
          <div className="absolute -bottom-0.5 -right-0.5 w-[15px] h-[15px] rounded-full bg-[#412A2A] ring-2 ring-white flex items-center justify-center">
            <span className="text-white text-[7px] font-black">나</span>
          </div>
        )}
      </div>

      {/* 이름 + 칭호 + 서브 통계 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={`font-bold text-[14px] truncate ${isMe ? "text-orange-700" : "text-gray-900"}`}>
            {user.nickName}
          </span>
          {categoryTitle && (
            <span className="flex-shrink-0 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-[2px] rounded border border-orange-100">
              {categoryTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
          {(user.weeklyCount ?? 0) > 0 && (
            <span>이번 주 <span className="font-semibold text-gray-500">{user.weeklyCount}회</span></span>
          )}
          {(user.streakWeeks ?? 0) >= 2 && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="font-semibold text-gray-500">{user.streakWeeks}주 연속</span>
            </>
          )}
        </div>
      </div>

      {/* 우측 수치 */}
      <div className="flex-shrink-0 min-w-[52px] text-right">
        {tabVariant === "overall" ? (
          <>
            <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">온도</div>
            <div className="text-[15px] font-black tabular-nums leading-tight" style={{ color: tier.color }}>
              {temp.toFixed(1)}<span className="text-[11px] font-semibold">°</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">인증</div>
            <div className="text-[15px] font-black text-gray-800 tabular-nums leading-tight">
              {user.postCount}<span className="text-[10px] font-semibold text-gray-400 ml-0.5">회</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── 스켈레톤 ─────────────────────────────────────────
function RankSkeleton({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1">
      <div className="w-6 h-3.5 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
      <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-24 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-2.5 w-32 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-[5px] w-full bg-gray-100 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="h-2.5 w-8 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-4 w-12 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// ── 포디엄 스켈레톤 ───────────────────────────────────
function PodiumSkeleton() {
  return (
    <div className="flex justify-center items-end gap-4 px-4 pt-4 pb-0 mb-6">
      {[50, 62, 50].map((s, i) => (
        <div key={i} className={`flex flex-col items-center ${i === 1 ? "scale-110" : ""}`}>
          <div
            className="rounded-full bg-gray-100 animate-pulse mb-2"
            style={{ width: s, height: s }}
          />
          <div className="h-3 w-14 bg-gray-100 rounded-full animate-pulse mb-1" />
          <div className="h-2.5 w-10 bg-gray-100 rounded-full animate-pulse mb-2.5" />
          <div
            className={`w-[72px] bg-gray-100 animate-pulse rounded-t-lg ${
              i === 1 ? "h-24" : i === 0 ? "h-16" : "h-10"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

// ── 빈 상태 ──────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2.5">
      <div className="text-4xl mb-1">🔥</div>
      <p className="text-gray-600 text-sm font-semibold">아직 {label} 랭킹 데이터가 없어요</p>
      <p className="text-gray-400 text-xs">운동 기록을 추가하면 여기 표시돼요!</p>
    </div>
  );
}

// ── 전체 랭킹 (관심운동 탭과 동일한 클린 스타일) ────────────────
function OverallRanking({ currentUserId }: { currentUserId?: number }) {
  const { data, isLoading, isError } = useQuery<RankUser[]>({
    queryKey: ["ranking", "overall"],
    queryFn: async () => {
      const res = await fetch("/api/ranking");
      if (!res.ok) throw new Error();
      return (await res.json()).data ?? [];
    },
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) return (
    <div className="flex flex-col mt-2">
      {Array(10).fill(0).map((_, i) => <RankSkeleton key={i} index={i} />)}
    </div>
  );
  if (isError || !data || data.length === 0) return <EmptyState label="전체" />;

  return (
    <div className="flex flex-col mt-2 px-1">
      {data.map((user, i) => {
        let title = (user as any).title as string | undefined;
        
        if (title) {
          title = title.replace(/👑|🔥/g, "").trim();
        }

        if (user.rank === 1) title = `👑 ${title ?? "열정왕"}`;
        else if (user.rank <= 3) title = title ? `🔥 ${title}` : undefined;
        else title = undefined;

        return (
          <RankItem
            key={user.memberId}
            user={user}
            isMe={currentUserId === user.memberId}
            index={i}
            categoryTitle={title}
            tabVariant="overall"
          />
        );
      })}
    </div>
  );
}

// ── 관심운동 랭킹 ─────────────────────────────────────
function InterestRanking({
  currentUserId,
  userCategories,
}: {
  currentUserId?: number;
  userCategories: string[];
}) {
  const [selectedCat, setSelectedCat] = useState<string>(userCategories[0] ?? "");

  const { data, isLoading, isError } = useQuery<RankUser[]>({
    queryKey: ["ranking", "category", selectedCat],
    queryFn: async () => {
      const res = await fetch(`/api/ranking?category=${encodeURIComponent(selectedCat)}`);
      if (!res.ok) throw new Error();
      return (await res.json()).data ?? [];
    },
    enabled: !!selectedCat,
    staleTime: 60_000,
    retry: false,
  });

  if (userCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2.5">
        <div className="text-4xl mb-1">⚡</div>
        <p className="text-gray-600 text-sm font-semibold">관심 운동을 설정해보세요</p>
        <p className="text-gray-400 text-xs">내 종목에서 나의 순위를 확인할 수 있어요</p>
        <Link
          href="/accounts/profile"
          className="mt-2 text-xs font-bold text-[#412A2A] bg-[#412A2A]/5 px-4 py-2 rounded-full hover:bg-[#412A2A]/10 transition-colors"
        >
          프로필 편집하기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-4">
      {/* 카테고리 pill 탭 */}
      <div
        className="flex gap-2 overflow-x-auto px-4 pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {userCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`relative flex-shrink-0 text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
              selectedCat === cat
                ? "text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {selectedCat === cat && (
              <motion.span
                layoutId="activeCatPill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <span className="relative">{cat}</span>
          </button>
        ))}
      </div>

      {/* 리스트 */}
      {isLoading ? (
        <div className="px-1">
          {Array(5).fill(0).map((_, i) => <RankSkeleton key={i} index={i} />)}
        </div>
      ) : isError || !data || data.length === 0 ? (
        <EmptyState label={selectedCat} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCat}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="px-1"
          >
            {data.map((user, i) => {
              const catTitle =
                user.rank === 1 ? `👑 ${selectedCat} 열정왕`
                : user.rank <= 3 ? `🔥 ${selectedCat} 열정러`
                : undefined;
              return (
                <RankItem
                  key={user.memberId}
                  user={user}
                  isMe={currentUserId === user.memberId}
                  index={i}
                  categoryTitle={catTitle}
                  tabVariant="category"
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── 크루 랭킹 ────────────────────────────────────────
function CrewRanking() {
  const { data, isLoading, isError } = useQuery<RankUser[]>({
    queryKey: ["ranking", "crew"],
    queryFn: async () => {
      const res = await fetch("/api/ranking?type=crew");
      if (!res.ok) throw new Error();
      return (await res.json()).data ?? [];
    },
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) return (
    <div className="flex flex-col mt-2">
      {Array(5).fill(0).map((_, i) => <RankSkeleton key={i} index={i} />)}
    </div>
  );
  if (isError || !data || data.length === 0) return <EmptyState label="크루" />;

  return (
    <div className="flex flex-col mt-2 px-1">
      {data.map((user, i) => {
        let title = (user as any).title as string | undefined;

        if (title) {
          title = title.replace(/👑|🔥/g, "").trim();
        }

        if (user.rank === 1) title = `👑 ${title ?? "핫 크루"}`;
        else if (user.rank <= 3) title = title ? `🔥 ${title}` : undefined;
        else title = undefined;

        return (
          <RankItem
            key={user.memberId}
            user={user}
            isMe={false}
            index={i}
            categoryTitle={title}
            tabVariant="overall"
          />
        );
      })}
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────
type RankingPageProps = {
  currentUserId?: number;
  user?: User | null;
  isMobile?: boolean;
};

export default function RankingPage({ currentUserId, user, isMobile = false }: RankingPageProps) {
  const [activeTab, setActiveTab] = useState<RankTab>("전체");
  const userCategories = useMemo(() => user?.categories ?? [], [user]);

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      {/* 헤더 */}
      <div
        className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100/80 ${
          isMobile ? "pt-5" : "pt-8"
        }`}
      >
        <div className="px-5 mb-4 flex items-end justify-between">
          <h1 className="text-[22px] font-black tracking-tight text-gray-900 leading-none">
            🔥 랭킹
          </h1>
          <span className="text-[11px] text-gray-300 font-medium pb-px">열정온도 기준</span>
        </div>

        {/* 탭 */}
        <div className="flex px-5 gap-6">
          {(["전체", "관심운동", "크루"] as RankTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-sm font-bold transition-colors ${
                activeTab === tab ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="mainTabBar"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t bg-gradient-to-r from-orange-500 to-red-500"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className={`pb-6 w-full ${!isMobile && "max-w-2xl mx-auto"}`}>
        <AnimatePresence mode="wait">
          {activeTab === "전체" ? (
            <motion.div
              key="overall"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <OverallRanking currentUserId={currentUserId} />
            </motion.div>
          ) : activeTab === "관심운동" ? (
            <motion.div
              key="interest"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <InterestRanking
                currentUserId={currentUserId}
                userCategories={userCategories}
              />
            </motion.div>
          ) : (
            <motion.div
              key="crew"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <CrewRanking />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
