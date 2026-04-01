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

// ── 온도 계산 ──────────────────────────────────────────
function calcTemp(postCount: number): number {
  return 36.5 + 0.8 * postCount;
}

// ── 온도 → 색상 (sunset 팔레트) ───────────────────────────
// 슬레이트 → 앰버 → 오렌지 → 코랄 → 와인레드
function getTempColor(temp: number): {
  primary: string;    // 대표색 hex
  soft: string;       // 연한 변형 (ring, badge bg)
  glow: string;       // box-shadow
  gradient: string;   // tailwind gradient classes
  intensity: number;  // 0~1
} {
  const norm = Math.max(0, Math.min(1, (temp - 36.5) / (90 - 36.5)));

  if (norm < 0.18) return {
    primary: "#94A3B8",  // slate — 방전한 몸의 온도
    soft: "#F1F5F9",
    glow: "none",
    gradient: "from-slate-200 to-slate-300",
    intensity: norm,
  };
  if (norm < 0.38) return {
    primary: "#D97706",  // amber-600 — 초양 촛빛
    soft: "#FEF3C7",
    glow: `0 0 10px rgba(217,119,6,${0.15 + norm * 0.3})`,
    gradient: "from-yellow-300 to-amber-400",
    intensity: norm,
  };
  if (norm < 0.56) return {
    primary: "#EA580C",  // orange-600 — 따뜻한 빛
    soft: "#FFEDD5",
    glow: `0 0 12px rgba(234,88,12,${0.15 + norm * 0.35})`,
    gradient: "from-amber-400 to-orange-500",
    intensity: norm,
  };
  if (norm < 0.76) return {
    primary: "#C2410C",  // orange-700 — 단단한 빛
    soft: "#FED7AA",
    glow: `0 0 14px rgba(194,65,12,${0.18 + norm * 0.3})`,
    gradient: "from-orange-500 to-red-400",
    intensity: norm,
  };
  // 최고 온도— 와인 레드 (중후 노을)
  return {
    primary: "#9B2020",  // 따뜻한 와인레드 — 시빨겋지 않는 진한 붉
    soft: "#FEE2E2",
    glow: `0 0 16px rgba(155,32,32,${0.2 + norm * 0.25})`,
    gradient: "from-red-400 to-rose-600",
    intensity: norm,
  };
}

// ── 불꽃 이모지 (온도에 따라 개수) ──────────────────
function FlameIndicator({ temp, size = "sm" }: { temp: number; size?: "sm" | "xs" }) {
  const norm = Math.max(0, Math.min(1, (temp - 36.5) / (90 - 36.5)));
  const count = norm < 0.15 ? 0 : norm < 0.4 ? 1 : norm < 0.65 ? 2 : norm < 0.85 ? 3 : 4;
  if (count === 0) return null;
  return (
    <span className={`tabular-nums leading-none ${size === "xs" ? "text-[10px]" : "text-xs"}`}>
      {"🔥".repeat(count)}
    </span>
  );
}

// ── 온도 바 — 선셋 그라데이션 고정 ───────────────────────────
// 전체 스펙트럼을 일정한 바에 보여주면 단계가 보여서 즐거움
function TempBar({ temp }: { temp: number }) {
  // 전체 범위 (36.5~100도) 기준 내 체워진 버퍼
  const pct = Math.max(4, Math.min(100, ((temp - 36.5) / (100 - 36.5)) * 100));
  // 선셋 다중 스톱: 황금 → 암버 → 오렌지 → 코랄 → 와인
  const barBg = "linear-gradient(to right, #FCD34D, #F59E0B, #EA580C, #C2410C, #9B2020)";
  return (
    <div className="relative h-[5px] w-full rounded-full bg-gray-100 overflow-hidden mt-1.5">
      {/* 전체 그라데이션 본체 */}
      <div className="absolute inset-y-0 left-0 right-0" style={{ background: barBg }} />
      {/* 오른쪽 마스크 — 채워지지 않은 부분을 덩덀 */}
      <motion.div
        className="absolute inset-y-0 right-0 bg-gray-100"
        initial={{ width: "100%" }}
        animate={{ width: `${100 - pct}%` }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ── 1위 히어로 카드 ───────────────────────────────────
function FirstPlaceCard({ user, isMe, title }: { user: RankUser; isMe?: boolean; title?: string }) {
  const temp = calcTemp(user.postCount);
  const tc = getTempColor(temp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-4 mb-3 rounded-2xl overflow-hidden relative"
      style={{ boxShadow: `0 4px 24px ${tc.primary}22` }}
    >
      {/* 배경 그라디언트 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${tc.primary}14 0%, ${tc.primary}06 100%)`,
        }}
      />
      {/* 우측 상단 장식용 큰 온도 숫자 */}
      <div
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[72px] font-black leading-none tabular-nums select-none pointer-events-none"
        style={{ color: tc.primary, opacity: 0.07 }}
      >
        {temp.toFixed(0)}°
      </div>

      <div className="relative flex items-center gap-4 px-5 py-4">
        {/* 프로필 */}
        <div className="relative flex-shrink-0">
          <div
            className={`absolute -inset-[3px] rounded-full bg-gradient-to-br ${tc.gradient}`}
            style={{ boxShadow: tc.glow, opacity: 0.55 + tc.intensity * 0.35 }}
          />
          <div className="relative rounded-full overflow-hidden bg-white ring-2 ring-white">
            <ProfileImg url={user.profileImageUrl ?? undefined} size={62} />
          </div>
          {isMe && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#412A2A] ring-2 ring-white flex items-center justify-center">
              <span className="text-white text-[8px] font-black">나</span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base leading-none">👑</span>
            <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">1st</span>
          </div>
          <div className="font-black text-[18px] text-gray-900 truncate leading-tight mb-1.5">
            {user.nickName}
          </div>
          {/* 칭호 */}
          {title && (
            <span
              className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ color: tc.primary, backgroundColor: `${tc.primary}12`, border: `1px solid ${tc.primary}25` }}
            >
              {title}
            </span>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            {(user.weeklyCount ?? 0) > 0 && (
              <span className="text-[11px] text-gray-500">
                이번 주 <span className="font-bold text-gray-700">{user.weeklyCount}회</span>
              </span>
            )}
            {(user.streakWeeks ?? 0) >= 2 && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                <span className="text-[11px] font-bold text-gray-500">{user.streakWeeks}주 연속</span>
              </>
            )}
          </div>
        </div>

        {/* 온도 */}
        <div className="flex-shrink-0 text-right">
          <div className="flex flex-col items-end">
            <FlameIndicator temp={temp} size="sm" />
            <span
              className="text-[26px] font-black tabular-nums leading-tight"
              style={{ color: tc.primary }}
            >
              {temp.toFixed(1)}
              <span className="text-[16px]">°</span>
            </span>
          </div>
        </div>
      </div>

      {/* 하단 온도 바 */}
      <div className="px-5 pb-4">
        <TempBar temp={temp} />
      </div>
    </motion.div>
  );
}

// ── 2·3위 사이드 카드 ──────────────────────────────────
function RunnerUpCard({ user, isMe, index, title }: { user: RankUser; isMe?: boolean; index: number; title?: string }) {
  const temp = calcTemp(user.postCount);
  const tc = getTempColor(temp);
  const medal = user.rank === 2 ? "🥈" : "🥉";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 rounded-2xl border border-gray-100 px-3.5 py-3.5 flex flex-col gap-2.5 bg-white"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      {/* 상단: 순위 + 메달 */}
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">
          {user.rank === 2 ? "2nd" : "3rd"}
        </span>
        <span className="text-base">{medal}</span>
      </div>
      {/* 칭호 */}
      {title && (
        <span
          className="inline-block text-[9px] font-black px-1.5 py-[2px] rounded-full mb-1"
          style={{ color: tc.primary, backgroundColor: `${tc.primary}10`, border: `1px solid ${tc.primary}20` }}
        >
          {title}
        </span>
      )}

      {/* 프로필 */}
      <div className="relative self-start">
        <div
          className={`absolute -inset-[2.5px] rounded-full bg-gradient-to-br ${tc.gradient}`}
          style={{ opacity: 0.4 + tc.intensity * 0.4, boxShadow: tc.glow }}
        />
        <div className="relative rounded-full overflow-hidden bg-white ring-[1.5px] ring-white">
          <ProfileImg url={user.profileImageUrl ?? undefined} size={44} />
        </div>
        {isMe && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#412A2A] ring-2 ring-white flex items-center justify-center">
            <span className="text-white text-[7px] font-black">나</span>
          </div>
        )}
      </div>

      {/* 닉네임 */}
      <div className="font-bold text-[14px] text-gray-900 truncate" title={user.nickName}>
        {user.nickName}
      </div>

      {/* 온도 + 바 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <FlameIndicator temp={temp} size="xs" />
          <span
            className="text-[15px] font-black tabular-nums leading-none"
            style={{ color: tc.primary }}
          >
            {temp.toFixed(1)}°
          </span>
        </div>
        <TempBar temp={temp} />
      </div>
    </motion.div>
  );
}

// ── 일반 랭킹 아이템 ─────────────────────────────────
function RankItem({
  user,
  isMe,
  index,
  categoryTitle,
  hideTemp,
}: {
  user: RankUser;
  isMe?: boolean;
  index: number;
  categoryTitle?: string;
  hideTemp?: boolean;
}) {
  const temp = calcTemp(user.postCount);
  const tc = getTempColor(temp);

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
      <div
        className={`w-6 flex-shrink-0 text-center font-black text-[13px] ${
          user.rank === 1
            ? "text-amber-500"
            : user.rank === 2
            ? "text-slate-400"
            : user.rank === 3
            ? "text-orange-400"
            : "text-gray-300"
        }`}
      >
        {user.rank}
      </div>

      {/* 프로필 + 온도 링 */}
      <div className="relative flex-shrink-0">
        {!hideTemp && (
          <div
            className={`absolute -inset-[2.5px] rounded-full bg-gradient-to-br ${tc.gradient}`}
            style={{ opacity: 0.25 + tc.intensity * 0.55, boxShadow: tc.glow }}
          />
        )}
        <div className="relative rounded-full overflow-hidden bg-white ring-[1px] ring-white">
          <ProfileImg url={user.profileImageUrl ?? undefined} size={40} />
        </div>
        {isMe && (
          <div className="absolute -bottom-0.5 -right-0.5 w-[15px] h-[15px] rounded-full bg-[#412A2A] ring-2 ring-white flex items-center justify-center">
            <span className="text-white text-[7px] font-black">나</span>
          </div>
        )}
      </div>

      {/* 이름 + 메타 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span
            className={`font-bold text-[14px] truncate ${
              isMe ? "text-orange-700" : "text-gray-900"
            }`}
          >
            {user.nickName}
          </span>
          {categoryTitle && (
            <span className="flex-shrink-0 text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-[2px] rounded-md border border-orange-100">
              {categoryTitle}
            </span>
          )}
        </div>

        {/* 서브 통계 */}
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

        {/* 온도 게이지 바 (전체 탭만) */}
        {!hideTemp && <TempBar temp={temp} />}
      </div>

      {/* 우측: 수치 */}
      <div className="flex-shrink-0 min-w-[52px] text-right">
        {hideTemp ? (
          <>
            <div className="text-[9px] font-bold text-gray-300 tracking-widest uppercase mb-0.5">인증</div>
            <div className="text-[15px] font-black text-gray-700 tabular-nums leading-tight">
              {user.postCount}
              <span className="text-[10px] font-semibold text-gray-400 ml-0.5">회</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-end mb-0.5">
              <FlameIndicator temp={temp} size="xs" />
            </div>
            <div
              className="text-[15px] font-black tabular-nums leading-tight"
              style={{ color: tc.primary }}
            >
              {temp.toFixed(1)}
              <span className="text-[11px] font-semibold">°</span>
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

  return (
    <div className="flex flex-col mt-2 px-1">
      {data.map((user, i) => (
        <RankItem
          key={user.memberId}
          user={user}
          isMe={currentUserId === user.memberId}
          index={i}
          categoryTitle={(user as any).title}
        />
      ))}
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
              let catTitle = undefined;
              if (user.rank === 1) catTitle = `👑 ${selectedCat} 열정왕`;
              else if (user.rank <= 3) catTitle = `🔥 ${selectedCat} 열정러`;
              return (
                <RankItem
                  key={user.memberId}
                  user={user}
                  isMe={currentUserId === user.memberId}
                  index={i}
                  categoryTitle={catTitle}
                  hideTemp
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
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
          {(["전체", "관심운동"] as RankTab[]).map((tab) => (
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
          ) : (
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
