"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "react-simple-pull-to-refresh";
import Footer from "@/components/Footer";
import FeedTabs, { type FeedTab } from "@/features/feed/FeedTabs";
import FeedList from "@/features/feed/FeedList";
import { TextLogo } from "@/components/Logo";
import { LoadingIcon } from "@/components/Icons";

const refreshIndicator = (
  <div className="flex justify-center py-2">
    <LoadingIcon color="text-theme" />
  </div>
);

export default function MobileFeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("전체");
  const queryClient = useQueryClient();

  // feed 관련 전부 새로고침
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["feed"] });
  }, [queryClient]);

  return (
    <div className="w-full h-dvh flex flex-col overscroll-y-contain">
      <div className="bg-white px-4 z-20">
        <div className="flex items-center justify-between px-5 py-4">
          <TextLogo />
        </div>
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="flex-1 min-h-0 overscroll-y-contain">
        <PullToRefresh
          onRefresh={handleRefresh}
          pullingContent={refreshIndicator}
          refreshingContent={refreshIndicator}
        >
          <div className="pb-22">
            <FeedList activeTab={activeTab} />
          </div>
        </PullToRefresh>
      </div>
      <Footer />
    </div>
  );
}
