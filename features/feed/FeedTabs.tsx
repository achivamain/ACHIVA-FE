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
    <div
      className="flex flex-nowrap overflow-x-auto gap-[6px] min-[400px]:gap-2 px-4 py-3 hide-scrollbar w-full"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-shrink-0 flex justify-center items-center px-[18px] min-[375px]:px-[20px] min-[430px]:px-[22px] py-[8px] h-[36px] min-[430px]:h-[40px] rounded-full font-semibold text-[13px] min-[375px]:text-[14px] min-[430px]:text-[15px] sm:text-lg leading-[21px] transition-colors shadow-sm ${
            activeTab === tab
              ? "bg-[#412A2A] border border-[#412A2A] text-white"
              : "bg-white border border-[#D9D9D9] text-[#412A2A] hover:bg-gray-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
