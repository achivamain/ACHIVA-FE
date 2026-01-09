"use client";

// 피드의 각 탭 관련 처리 
// 카테고리별 검색 추가 예정 
export type FeedTab = "전체" | "관심" | "응원" | "친구";

type FeedTabsProps = {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
};

const tabs: FeedTab[] = ["전체", "관심", "응원", "친구"];

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex gap-2 px-4 py-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab
              ? "bg-[#412A2A] text-white"
              : "bg-white border border-[#412A2A]/20 text-[#412A2A] hover:bg-[#412A2A]/5"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

