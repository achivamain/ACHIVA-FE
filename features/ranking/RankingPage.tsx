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

// ── 온도 계산 ────────────────────────────────────────
function calcTemp(postCount: number): number {
  return 36.5 + 0.8 * postCount;
}

// ── 온도 → 불 색상 ────────────────────────────────────
function getTempColor(temp: number) {
  const norm = Math.max(0, Math.min(1, (temp - 36.5) / (90 - 36.5)));
  if (norm < 0.2) return { primary: "#9CA3AF", glow: "none", gradient: "from-gray-300 to-gray-400", intensity: norm };
  if (norm < 0.45) return { primary: "#F59E0B", glow: `0 0 12px rgba(245,158,11,${norm * 0.7})`, gradient: "from-yellow-400 to-amber-500", intensity: norm };
  if (norm < 0.7) return { primary: "#F97316", glow: `0 0 16px rgba(249,115,22,${norm * 0.8})`, gradient: "from-orange-400 to-red-500", intensity: norm };
  return { primary: "#EF4444", glow: `0 0 20px rgba(239,68,68,${0.4 + norm * 0.4})`, gradient: "from-red-500 to-rose-600", intensity: norm };
}

// ── 불꽃 이모지 (온도에 따라 개수) ────────────────────
function FlameIndicator({ temp, size = "sm" }: { temp: number; size?: "sm" | "xs" }) {
  const norm = Math.max(0, Math.min(1, (temp - 36.5) / (90 - 36.5)));
  const count = norm < 0.15 ? 0 : norm < 0.4 ? 1 : norm < 0.65 ? 2 : norm < 0.85 ? 3 : 4;
  if (count === 0) return null;
  return <span className={`tabular-nums leading-none ${size === "xs" ? "text-[10px]" : "text-xs"}`}>{"🔥".repeat(count)}</span>;
}

// ── 온도 바 ──────────────────────────────────────────
function TempBar({ temp }: { temp: number }) {
  const tc = getTempColor(temp);
  const pct = Math.max(4, Math.min(100, ((temp - 36.5) / (100 - 36.5)) * 100));
  return (
    <div className="relative h-[5px] w-full rounded-full bg-gray-100 overflow-hidden mt-1.5">
      <motion.div
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tc.gradient}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ── 포디엄 카드 (탑3) ─────────────────────────────────
function PodiumCard({ user, isMe, index }: { user: RankUser; isMe?: boolean; index: number }) {
  const temp = calcTemp(user.postCount);
  const tc = getTempColor(temp);
  const isFirst = user.rank === 1;
  const medal = user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉";
  const podiumH = isFirst ? "h-24" : user.rank === 2 ? "h-16" : "h-10";
  const order = isFirst ? "order-2" : user.rank === 2 ? "order-1" : "order-3";
  const podiumGradient = isFirst ? `bg-gradient-to-t ${tc.gradient}` : user.rank === 2 ? "bg-gradient-to-t from-gray-300 to-gray-200" : "bg-gradient-to-t from-orange-300 to-amber-200";

  return (
    <motion.div
      className={`flex flex-col items-center ${order} ${isFirst ? "scale-110" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {isFirst && (
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 300 }} className="text-xl mb-1">
          👑
        </motion.div>
      )}
      <div className="relative mb-2">
        <div className={`absolute -inset-[3px] rounded-full bg-gradient-to-br ${tc.gradient}`} style={{ opacity: 0.3 + tc.intensity * 0.5, boxShadow: tc.glow }} />
        <div className="relative rounded-full overflow-hidden bg-white ring-[1.5px] ring-white">
          <ProfileImg url={user.profileImageUrl ?? undefined} size={isFirst ? 62 : 50} />
        </div>
        <div className="absolute -bottom-1 -right-1 text-base leading-none drop-shadow">{medal}</div>
        {isMe && (
          <div className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-[#412A2A] ring-2 ring-white flex items-center justify-center">
            <span className="text-white text-[8px] font-black">나</span>
          </div>
        )}
      </div>
      <span className="text-[12px] font-bold text-gray-800 truncate max-w-[70px] text-center leading-tight" title={user.nickName}>{user.nickName}</span>
      <div className="flex items-center gap-0.5 mt-0.5">
        <FlameIndicator temp={temp} size="xs" />
        <span className="text-[11px] font-extrabold tabular-nums" style={{ color: tc.primary }}>{temp.toFixed(1)}°</span>
      </div>
      <div className={`w-[72px] mt-2.5 rounded-t-lg ${podiumH} ${podiumGradient} flex items-center justify-center shadow-sm`}>
        <span className="text-white font-black text-base drop-shadow-sm">{user.rank}</span>
      </div>
    </motion.div>
  );
}

// ── 일반 랭킹 아이템 ─────────────────────────────────
function RankItem({ user, isMe, index, categoryTitle, hideTemp }: { user: RankUser; isMe?: boolean; index: number; categoryTitle?: string; hideTemp?: boolean }) {
  const temp = calcTemp(user.postCount);
  const tc = getTempColor(temp);
  const rankText = user.rank === 1 ? "text-amber-500" : user.rank === 2 ? "text-slate-400" : user.rank === 3 ? "text-orange-400" : "text-gray-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-colors ${isMe ? "bg-orange-50/60 ring-1 ring-orange-200/60" : "hover:bg-gray-50/70"}`}
    >
      <div className={`w-6 flex-shrink-0 text-center font-black text-[13px] ${rankText}`}>{user.rank}</div>
      <div className="relative flex-shrink-0">
        {!hideTemp && <div className={`absolute -inset-[2.5px] rounded-full bg-gradient-to-br ${tc.gradient}`} style={{ opacity: 0.25 + tc.intensity * 0.55, boxShadow: tc.glow }} />}
        <div className="relative rounded-full overflow-hidden bg-white ring-[1px] ring-white">
          <ProfileImg url={user.profileImageUrl ?? undefined} size={40} />
        </div>
        {isMe && (
          <div className="absolute -bottom-0.5 -right-0.5 w-[15px] h-[15px] rounded-full bg-[#412A2A] ring-2 ring-white flex items-center justify-center">
            <span className="text-white text-[7px] font-black">나</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={`font-bold text-[14px] truncate ${isMe ? "text-orange-700" : "text-gray-900"}`}>{user.nickName}</span>
          {categoryTitle && <span className="flex-shrink-0 text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-[2px] rounded-md border border-orange-100">{categoryTitle}</span>}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
          {(user.weeklyCount ?? 0) > 0 && <span>이번 주 <span className="font-semibold text-gray-500">{user.weeklyCount}회</span></span>}
          {(user.streakWeeks ?? 0) >= 2 && <><span className="w-0.5 h-0.5 rounded-full bg-gray-300 flex-shrink-0" /><span className="font-semibold text-gray-500">{user.streakWeeks}주 연속</span></>}
        </div>
        {!hideTemp && <TempBar temp={temp} />}
      </div>
      <div className="flex-shrink-0 min-w-[52px] text-right">
        {hideTemp ? (
          <>
            <div className="text-[9px] font-bold text-gray-300 tracking-widest uppercase mb-0.5">인증</div>
            <div className="text-[15px] font-black text-gray-700 tabular-nums leading-tight">{user.postCount}<span className="text-[10px] font-semibold text-gray-400 ml-0.5">회</span></div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-end mb-0.5"><FlameIndicator temp={temp} size="xs" /></div>
            <div className="text-[15px] font-black tabular-nums leading-tight" style={{ color: tc.primary }}>{temp.toFixed(1)}<span className="text-[11px] font-semibold">°</span></div>
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2.5">
      <div className="text-4xl mb-1">🔥</div>
      <p className="text-gray-600 text-sm font-semibold">아직 {label} 랭킹 데이터가 없어요</p>
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

  if (isLoading) return <div className="flex flex-col mt-2">{Array(10).fill(0).map((_, i) => <RankSkeleton key={i} index={i} />)}</div>;
  if (isError || !data || data.length === 0) return <EmptyState label="전체" />;

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="flex flex-col">
      <div className="flex justify-center items-end gap-4 px-4 pt-5 pb-0 mb-5">
        {podiumOrder.map((u, i) => (
          <PodiumCard key={u.memberId} user={u} isMe={currentUserId === u.memberId} index={i} />
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
        <Link href="/accounts/profile" className="mt-2 text-xs font-bold text-[#412A2A] bg-[#412A2A]/5 px-4 py-2 rounded-full hover:bg-[#412A2A]/10 transition-colors">프로필 편집하기 →</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-4">
      <div className="flex gap-2 overflow-x-auto px-4 pb-4" style={{ scrollbarWidth: "none" }}>
        {userCategories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCat(cat)} className={`relative flex-shrink-0 text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${selectedCat === cat ? "text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            {selectedCat === cat && <motion.span layoutId="activeCatPill" className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500" transition={{ type: "spring", stiffness: 450, damping: 32 }} />}
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
          <motion.div key={selectedCat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="px-1">
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

type RankingPageProps = { currentUserId?: number; user?: User | null; isMobile?: boolean };

export default function RankingPage({ currentUserId, user, isMobile = false }: RankingPageProps) {
  const [activeTab, setActiveTab] = useState<RankTab>("전체");
  const userCategories = useMemo(() => user?.categories ?? [], [user]);

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      <div className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100/80 ${isMobile ? "pt-5" : "pt-8"}`}>
        <div className="px-5 mb-4 flex items-end justify-between">
          <h1 className="text-[22px] font-black tracking-tight text-gray-900 leading-none">🔥 랭킹</h1>
          <span className="text-[11px] text-gray-300 font-medium pb-px">열정온도 기준</span>
        </div>
        <div className="flex px-5 gap-6">
          {(["전체", "관심운동"] as RankTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === tab ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
              {tab}
              {activeTab === tab && <motion.div layoutId="mainTabBar" className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t bg-gradient-to-r from-orange-500 to-red-500" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
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
