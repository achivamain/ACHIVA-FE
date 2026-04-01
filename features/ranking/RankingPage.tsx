"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/User";
import ProfileImg from "@/components/ProfileImg";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

// ── 타입 ──────────────────────────────────────────────
type RankTab = "전체" | "관심운동";

type RankUser = {
  rank: number;
  memberId: number;
  nickName: string;
  profileImageUrl: string | null;
  postCount: number;
  weeklyCount: number;
  streakWeeks: number;
};

// ── 온도 계산 (제한 없음) ────────────────────────────────
function calcTemp(postCount: number): number {
  return 36.5 + 0.8 * postCount;
}

// ── 티어 정보 ────────────────────────────────────────
type TierInfo = {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  ringColor: string;
};

function getTier(temp: number): TierInfo {
  if (temp >= 100) return {
    label: "마스터",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.2)",
    glow: "0 0 16px rgba(124,58,237,0.35)",
    ringColor: "from-violet-500 via-purple-500 to-fuchsia-500",
  };
  if (temp >= 80) return {
    label: "다이아",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.2)",
    glow: "0 0 16px rgba(37,99,235,0.3)",
    ringColor: "from-blue-400 via-sky-400 to-cyan-400",
  };
  if (temp >= 65) return {
    label: "플래티넘",
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
    border: "rgba(5,150,105,0.2)",
    glow: "0 0 14px rgba(5,150,105,0.3)",
    ringColor: "from-emerald-400 via-teal-400 to-green-400",
  };
  if (temp >= 50) return {
    label: "골드",
    color: "#D97706",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.2)",
    glow: "0 0 14px rgba(217,119,6,0.3)",
    ringColor: "from-yellow-400 via-amber-400 to-orange-400",
  };
  if (temp >= 40) return {
    label: "실버",
    color: "#6B7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.2)",
    glow: "0 0 10px rgba(107,114,128,0.2)",
    ringColor: "from-gray-300 via-slate-300 to-zinc-300",
  };
  return {
    label: "브론즈",
    color: "#B45309",
    bg: "rgba(180,83,9,0.08)",
    border: "rgba(180,83,9,0.2)",
    glow: "0 0 10px rgba(180,83,9,0.2)",
    ringColor: "from-orange-400 via-amber-500 to-yellow-600",
  };
}

// ── 열정 온도 게이지 바 ──────────────────────────────
function TempBar({ temp }: { temp: number }) {
  const pct = Math.min(100, ((temp - 36.5) / (120 - 36.5)) * 100);
  const tier = getTier(temp);
  return (
    <div className="relative h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mt-1.5">
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tier.ringColor}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

// ── 탑3 포디엄 카드 ──────────────────────────────────
function PodiumCard({ user, rank, isMe, index }: { user: RankUser; rank: number; isMe?: boolean; index: number }) {
  const temp = calcTemp(user.postCount);
  const tier = getTier(temp);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  const isFirst = rank === 1;

  const podiumHeight = rank === 1 ? "h-24" : rank === 2 ? "h-16" : "h-10";
  const podiumBg = rank === 1
    ? "bg-gradient-to-t from-amber-400 to-amber-300"
    : rank === 2
    ? "bg-gradient-to-t from-slate-400 to-slate-300"
    : "bg-gradient-to-t from-orange-500 to-orange-400";
  const order = rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3";

  return (
    <motion.div
      className={`flex flex-col items-center ${order} ${isFirst ? "scale-110" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.12 }}
    >
      {isFirst && (
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4, type: "spring" }} className="text-xl mb-1">
          👑
        </motion.div>
      )}
      <div className="relative mb-2">
        <div className={`absolute -inset-[3px] rounded-full bg-gradient-to-br ${tier.ringColor} opacity-80`} style={{ filter: "blur(0.5px)" }} />
        <div className="relative rounded-full overflow-hidden bg-white" style={{ boxShadow: tier.glow }}>
          <ProfileImg url={user.profileImageUrl ?? undefined} size={isFirst ? 60 : 50} />
        </div>
        <div className="absolute -bottom-1 -right-1 text-base leading-none drop-shadow">{medal}</div>
        {isMe && (
          <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#412A2A] flex items-center justify-center">
            <span className="text-white text-[8px] font-black">나</span>
          </div>
        )}
      </div>
      <span className="text-xs font-bold text-gray-800 truncate max-w-[72px] text-center" title={user.nickName}>{user.nickName}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[10px] font-black px-1.5 py-[2px] rounded-full border" style={{ color: tier.color, backgroundColor: tier.bg, borderColor: tier.border }}>
          {tier.label}
        </span>
      </div>
      <span className="text-[11px] font-extrabold tabular-nums mt-0.5" style={{ color: tier.color }}>{temp.toFixed(1)}°</span>
      <div className={`w-20 mt-2 rounded-t-md ${podiumHeight} ${podiumBg} flex items-center justify-center`}>
        <span className="text-white font-black text-sm drop-shadow">{rank}</span>
      </div>
    </motion.div>
  );
}

// ── 일반 랭킹 아이템 ─────────────────────────────────
function RankItem({ user, isMe, index, categoryTitle, hideTemp }: { user: RankUser; isMe?: boolean; index: number; categoryTitle?: string; hideTemp?: boolean }) {
  const temp = calcTemp(user.postCount);
  const tier = getTier(temp);
  const rankStyle = user.rank === 1 ? "text-amber-500" : user.rank === 2 ? "text-slate-400" : user.rank === 3 ? "text-orange-400" : "text-gray-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-colors ${isMe ? "bg-[#412A2A]/[0.04] border border-[#412A2A]/10" : "hover:bg-gray-50/80"}`}
    >
      <div className={`w-6 flex-shrink-0 text-center font-black text-sm ${rankStyle}`}>{user.rank}</div>
      <div className="relative flex-shrink-0">
        {!hideTemp && (
          <div className={`absolute -inset-[2px] rounded-full bg-gradient-to-br ${tier.ringColor} opacity-60`} style={{ filter: "blur(0.5px)" }} />
        )}
        <div className="relative rounded-full overflow-hidden bg-white">
          <ProfileImg url={user.profileImageUrl ?? undefined} size={40} />
        </div>
        {isMe && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#412A2A] ring-2 ring-white flex items-center justify-center">
            <span className="text-white text-[7px] font-black">나</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={`font-bold text-[14px] truncate ${isMe ? "text-[#412A2A]" : "text-gray-900"}`}>{user.nickName}</span>
          {isMe && <span className="flex-shrink-0 text-[9px] font-black text-[#412A2A] bg-[#412A2A]/8 px-1.5 py-[2px] rounded-full border border-[#412A2A]/15">나</span>}
          {categoryTitle && <span className="flex-shrink-0 text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-[2px] rounded-md border border-orange-100">{categoryTitle}</span>}
          {!hideTemp && (
            <span className="flex-shrink-0 text-[9px] font-black px-1.5 py-[2px] rounded-full border" style={{ color: tier.color, backgroundColor: tier.bg, borderColor: tier.border }}>
              {tier.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
          {(user.weeklyCount ?? 0) > 0 && <span className="flex items-center gap-0.5"><span>🔥</span><span>{user.weeklyCount}회</span></span>}
          {(user.streakWeeks ?? 0) >= 2 && <><span className="w-0.5 h-0.5 rounded-full bg-gray-300" /><span className="text-indigo-400 font-semibold">{user.streakWeeks}주 연속</span></>}
        </div>
        {!hideTemp && <TempBar temp={temp} />}
      </div>
      <div className="flex-shrink-0 min-w-[52px] text-right">
        {hideTemp ? (
          <>
            <div className="text-[9px] font-bold text-gray-300 tracking-widest uppercase mb-0.5">인증</div>
            <div className="text-[16px] font-black text-gray-800 tabular-nums leading-tight">{user.postCount}<span className="text-[10px] font-bold text-gray-400 ml-0.5">회</span></div>
          </>
        ) : (
          <>
            <div className="text-[9px] font-bold tracking-widest uppercase mb-0.5" style={{ color: tier.color }}>열정온도</div>
            <div className="text-[16px] font-black tabular-nums leading-tight" style={{ color: tier.color }}>{temp.toFixed(1)}<span className="text-[11px] font-bold">°</span></div>
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
        <div className="h-1.5 w-full bg-gray-100 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="h-2.5 w-8 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-4 w-12 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2.5">
      <div className="text-4xl mb-1">🏅</div>
      <p className="text-gray-500 text-sm font-semibold">아직 {label} 랭킹 데이터가 없어요</p>
      <p className="text-gray-400 text-xs">운동 기록을 추가하면 여기 표시돼요!</p>
    </div>
  );
}

// ── 전체 랭킹 ─────────────────────────────────────────
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

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="flex flex-col">
      <div className="flex justify-center items-end gap-4 px-4 pt-5 pb-0 mb-5">
        {podiumOrder.map((u, i) => (
          <PodiumCard key={u.memberId} user={u} rank={u.rank} isMe={currentUserId === u.memberId} index={i} />
        ))}
      </div>
      <div className="flex items-center gap-3 px-5 mb-2">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] font-bold text-gray-300 tracking-[0.12em] uppercase">열정 순위</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="px-1">
        {rest.map((user, i) => (
          <RankItem key={user.memberId} user={user} isMe={currentUserId === user.memberId} index={i} categoryTitle={(user as any).title} />
        ))}
      </div>
    </div>
  );
}

// ── 관심운동 랭킹 ─────────────────────────────────────
function InterestRanking({ currentUserId, userCategories }: { currentUserId?: number; userCategories: string[] }) {
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
        <Link href="/accounts/profile" className="mt-2 text-xs font-bold text-[#412A2A] bg-[#412A2A]/5 px-4 py-2 rounded-full hover:bg-[#412A2A]/10 transition-colors">
          프로필 편집하기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-4">
      <div className="flex gap-2 overflow-x-auto px-4 pb-4" style={{ scrollbarWidth: "none" }}>
        {userCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`relative flex-shrink-0 text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${selectedCat === cat ? "text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            {selectedCat === cat && (
              <motion.span layoutId="activeCatPill" className="absolute inset-0 rounded-full bg-[#412A2A]" transition={{ type: "spring", stiffness: 450, damping: 32 }} />
            )}
            <span className="relative">{cat}</span>
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="px-1">{Array(5).fill(0).map((_, i) => <RankSkeleton key={i} index={i} />)}</div>
      ) : isError || !data || data.length === 0 ? (
        <EmptyState label={selectedCat} />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={selectedCat} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="px-1">
            {data.map((user, i) => {
              const catTitle = user.rank === 1 ? `👑 ${selectedCat} 열정왕` : user.rank <= 3 ? `🔥 ${selectedCat} 열정러` : undefined;
              return <RankItem key={user.memberId} user={user} isMe={currentUserId === user.memberId} index={i} categoryTitle={catTitle} hideTemp />;
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────
type RankingPageProps = { currentUserId?: number; user?: User | null; isMobile?: boolean };

export default function RankingPage({ currentUserId, user, isMobile = false }: RankingPageProps) {
  const [activeTab, setActiveTab] = useState<RankTab>("전체");
  const userCategories = useMemo(() => user?.categories ?? [], [user]);

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      <div className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100/80 ${isMobile ? "pt-5" : "pt-8"}`}>
        <div className="px-5 mb-4 flex items-end justify-between">
          <h1 className="text-[22px] font-black tracking-tight text-gray-900 leading-none">🏆 랭킹</h1>
          <span className="text-[11px] text-gray-300 font-medium pb-px">열정온도 기준</span>
        </div>
        <div className="flex px-5 gap-6">
          {(["전체", "관심운동"] as RankTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === tab ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="mainTabBar" className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t bg-[#412A2A]" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className={`pb-6 w-full ${!isMobile && "max-w-2xl mx-auto"}`}>
        <AnimatePresence mode="wait">
          {activeTab === "전체" ? (
            <motion.div key="overall" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
              <OverallRanking currentUserId={currentUserId} />
            </motion.div>
          ) : (
            <motion.div key="interest" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>
              <InterestRanking currentUserId={currentUserId} userCategories={userCategories} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
