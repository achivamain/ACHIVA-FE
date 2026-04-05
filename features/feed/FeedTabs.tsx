"use client";

import { motion } from "motion/react";
import { categories } from "@/types/Categories";

export const feedTabs = [...categories, "모임"] as const;

export type FeedTab = (typeof feedTabs)[number];
export const defaultFeedTab: FeedTab = feedTabs[0];

type FeedTabsProps = {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
};

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="border-b border-gray-100/80 px-5 w-full">
      <div
        className="flex items-end gap-6 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {feedTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`relative pb-3 text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="feedTabBar"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t bg-gradient-to-r from-orange-500 to-red-500"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
