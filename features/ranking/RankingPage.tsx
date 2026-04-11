"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import ProfileImg from "@/components/ProfileImg";
import { categories as allCategories } from "@/types/Categories";
import type { User } from "@/types/User";
import {
  calculateCrewTemperature,
  type CategoryRankingItem,
  type CrewRankingItem,
  type OverallRankingItem,
} from "@/lib/ranking";

// 기록 0회인 사람/모임 보이게 할 지 설정 
const SHOW_INACTIVE_OVERALL_RANKING = false;
const SHOW_INACTIVE_CREW_RANKING = false;

function isActiveOverallRankingItem(user: OverallRankingItem) {
  return (
    user.articleCount > 0 ||
    user.weeklyWorkoutCount > 0 ||
    user.continuousGoalWeeks > 0
  );
}

function isActiveCrewRankingItem(crew: CrewRankingItem) {
  return crew.score > 0;
}

// 1~3등 표시
function getRankTextClass(rank: number) {
  if (rank === 1) return "text-amber-500";
  if (rank === 2) return "text-slate-500";
  if (rank === 3) return "text-amber-700";
  return "text-gray-300";
}

function getRankRowClass(rank: number) {
  if (rank === 1) return "border border-amber-200 bg-amber-50/40";
  if (rank === 2) return "border border-slate-300 bg-slate-50";
  if (rank === 3) return "border border-amber-700/20 bg-amber-50/30";
  return "border border-transparent hover:bg-gray-50/70";
}

function formatMetricValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

async function fetchRankingData<T>(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch ranking data");
  }

  const json = (await res.json()) as { data?: T };
  return json.data;
}

function RankSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1">
      <div className="w-6 h-3.5 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
      <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-24 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-2.5 w-32 bg-gray-100 rounded-full animate-pulse" />
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
      <p className="text-gray-600 text-sm font-semibold">
        아직 {label} 온도 데이터가 없어요
      </p>
      <p className="text-gray-400 text-xs">당신이 첫 주인공이 되세요!</p>
    </div>
  );
}

type RankingMetric = {
  key: string;
  text: string;
  highlight?: boolean;
  highlightTone?: "orange" | "mocha";
};

function UserRankingRow({
  rank,
  nickName,
  profileImageUrl,
  metrics,
  metricLabel,
  metricValue,
  index,
}: {
  rank: number;
  nickName: string;
  profileImageUrl: string | null;
  metrics: RankingMetric[];
  metricLabel: string;
  metricValue: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-colors ${getRankRowClass(rank)}`}
    >
      <div
        className={`w-6 flex-shrink-0 text-center font-black text-[13px] ${getRankTextClass(rank)}`}
      >
        {rank}
      </div>

      <div className="rounded-full overflow-hidden flex-shrink-0">
        <ProfileImg url={profileImageUrl ?? undefined} size={40} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-bold text-[14px] text-gray-900 truncate mb-0.5">
          {nickName}
        </div>
        {metrics.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium flex-wrap">
            {metrics.map((metric) => (
              metric.highlight ? (
                <span
                  key={metric.key}
                  className={`relative inline-flex items-center px-1.5 py-[1px] text-[11px] font-medium ${
                    metric.highlightTone === "mocha"
                      ? "text-[#8A6A57]"
                      : "text-[#D96B2B]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-0 -translate-y-px rounded-[4px] ${
                      metric.highlightTone === "mocha"
                        ? "bg-[#F6F1EC]"
                        : "bg-[#FFF1E8]"
                    }`}
                  />
                  <span className="relative z-10">{metric.text}</span>
                </span>
              ) : (
                <span key={metric.key}>{metric.text}</span>
              )
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 min-w-[64px] text-right">
        <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
          {metricLabel}
        </div>
        <div className="text-[15px] font-black text-gray-800 tabular-nums leading-tight">
          {metricValue}
        </div>
      </div>
    </motion.div>
  );
}

function CrewRankingRow({
  crew,
  index,
}: {
  crew: CrewRankingItem;
  index: number;
}) {
  const crewTemperature = calculateCrewTemperature(crew.score);
  const badges = [
    crew.isOfficial ? "공식" : null,
  ].filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-colors ${getRankRowClass(crew.rank)}`}
    >
      <div
        className={`w-6 flex-shrink-0 text-center font-black text-[13px] ${getRankTextClass(crew.rank)}`}
      >
        {crew.rank}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="font-bold text-[14px] text-gray-900 truncate">
            {crew.name}
          </span>
          {badges.map((badge) => (
            <span
              key={badge}
              className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-[2px] rounded border border-orange-100"
            >
              {badge}
            </span>
          ))}
        </div>
        <div className="text-[11px] text-gray-500 line-clamp-1 mb-1">
          {crew.description || "소개가 아직 없어요."}
        </div>
        <div className="flex items-center gap-x-2 gap-y-1 text-[11px] text-gray-400 font-medium flex-wrap">
          <span className="inline-flex items-center gap-[3px] rounded-[4px] bg-gray-100 px-1.5 py-[1px] leading-none text-gray-500">
            <span>멤버</span>
            <span className="font-semibold text-gray-600">{crew.memberCount}</span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-600">{crew.maxMember}</span>
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 min-w-[52px] text-right">
        <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
          온도
        </div>
        <div className="text-[15px] font-black text-gray-800 tabular-nums leading-tight">
          {formatMetricValue(crewTemperature)}
        </div>
      </div>
    </motion.div>
  );
}

function OverallRanking() {
  const { data, isLoading, isError } = useQuery<OverallRankingItem[]>({
    queryKey: ["ranking", "overall"],
    queryFn: async () => (await fetchRankingData<OverallRankingItem[]>("/api/ranking")) ?? [],
    staleTime: 60_000,
    retry: false,
  });

  const filteredData = useMemo(
    () =>
      (data ?? []).filter((user) =>
        SHOW_INACTIVE_OVERALL_RANKING ? true : isActiveOverallRankingItem(user),
      ),
    [data],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col mt-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <RankSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError || filteredData.length === 0) {
    return <EmptyState label="전체" />;
  }

  return (
    <div className="flex flex-col mt-2 px-1">
      {filteredData.map((user, index) => (
        <UserRankingRow
          key={`${user.nickName}-${user.rank}`}
          rank={index + 1}
          nickName={user.nickName}
          profileImageUrl={user.profileImageUrl}
          metrics={[
            {
              key: "articleCount",
              text: `누적 인증 ${user.articleCount}회`,
            },
            {
              key: "weeklyWorkoutCount",
              text: `이번 주 ${user.weeklyWorkoutCount}회`,
              highlight: user.weeklyWorkoutCount >= 3,
              highlightTone: "mocha",
            },
            {
              key: "continuousGoalWeeks",
              text: `${user.continuousGoalWeeks}주 연속`,
              highlight: user.continuousGoalWeeks >= 3,
              highlightTone: "orange",
            },
          ]}
          metricLabel="온도"
          metricValue={formatMetricValue(user.temperature)}
          index={index}
        />
      ))}
    </div>
  );
}

function CategoryRanking({ category }: { category: string }) {
  const { data, isLoading, isError } = useQuery<CategoryRankingItem[]>({
    queryKey: ["ranking", "category", category],
    queryFn: async () =>
      (await fetchRankingData<CategoryRankingItem[]>(
        `/api/ranking?category=${encodeURIComponent(category)}`,
      )) ?? [],
    staleTime: 60_000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col mt-2 px-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <RankSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return <EmptyState label={category} />;
  }

  return (
    <div className="flex flex-col mt-2 px-1">
      {data.map((user, index) => (
        <UserRankingRow
          key={user.memberId}
          rank={user.rank}
          nickName={user.nickName}
          profileImageUrl={user.profileImageUrl}
          metrics={[
            {
              key: "articleCount",
              text: `${category} 인증 ${user.articleCount}회`,
            },
          ]}
          metricLabel="인증"
          metricValue={`${user.articleCount}회`}
          index={index}
        />
      ))}
    </div>
  );
}

function CrewRanking() {
  const { data, isLoading, isError } = useQuery<CrewRankingItem[]>({
    queryKey: ["ranking", "crew"],
    queryFn: async () =>
      (await fetchRankingData<CrewRankingItem[]>("/api/ranking?type=crew")) ?? [],
    staleTime: 60_000,
    retry: false,
  });

  const filteredData = useMemo(
    () =>
      (data ?? []).filter((crew) =>
        SHOW_INACTIVE_CREW_RANKING ? true : isActiveCrewRankingItem(crew),
      ),
    [data],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col mt-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <RankSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError || filteredData.length === 0) {
    return <EmptyState label="구역" />;
  }

  return (
    <div className="flex flex-col mt-2 px-1">
      {filteredData.map((crew, index) => (
        <CrewRankingRow
          key={crew.id}
          crew={{ ...crew, rank: index + 1 }}
          index={index}
        />
      ))}
    </div>
  );
}

type RankingPageProps = {
  currentUserId?: number;
  user?: User | null;
  isMobile?: boolean;
};

export default function RankingPage({
  currentUserId: _currentUserId,
  user: _user,
  isMobile = false,
}: RankingPageProps) {
  const [activeTab, setActiveTab] = useState<string>("전체");

  const tabDescription = useMemo(() => {
    if (activeTab === "전체") return "열정온도 기준";
    if (activeTab === "구역") return "열정온도 기준";
    return "인증 수 기준";
  }, [activeTab]);

  const tabs = useMemo(() => ["전체", ...allCategories, "구역"], []);

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      <div
        className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100/80 ${
          isMobile ? "pt-5" : "pt-8"
        }`}
      >
        <div className="px-5 mb-4 flex items-end justify-between">
          <h1 className="text-[22px] font-black tracking-tight text-gray-900 leading-none">
            🌡️ 온도
          </h1>
          <span className="text-[11px] text-gray-300 font-medium pb-px">
            {tabDescription}
          </span>
        </div>

        <div className="flex items-end px-5">
          <div
            className="flex gap-6 overflow-x-auto whitespace-nowrap hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-3 text-sm font-bold transition-colors flex-shrink-0 ${
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
      </div>

      <div
        className={`w-full ${
          isMobile
            ? "pb-[calc(104px+env(safe-area-inset-bottom))]"
            : "pb-6 max-w-2xl mx-auto"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === "전체" ? (
              <OverallRanking />
            ) : activeTab === "구역" ? (
              <CrewRanking />
            ) : (
              <CategoryRanking category={activeTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
