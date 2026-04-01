"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "react-simple-pull-to-refresh";
import Footer from "@/components/Footer";
import FeedTabs, { type FeedTab } from "@/features/feed/FeedTabs";
import FeedList from "@/features/feed/FeedList";
import { TextLogo } from "@/components/Logo";
import { LoadingIcon, SideBarHeartIcon } from "@/components/Icons";
import { AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";

const Drawer = dynamic(() => import("@/components/Drawer"), { ssr: false });
const Notifications = dynamic(
  () => import("@/features/user/Notifications"),
  { ssr: false },
);

const refreshIndicator = (
  <div className="flex justify-center py-2">
    <LoadingIcon color="text-theme" />
  </div>
);

export default function MobileFeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("전체");
  const [isCheerOpen, setIsCheerOpen] = useState(false);
  const queryClient = useQueryClient();

  // feed 관련 전부 새로고침
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["feed"] });
  }, [queryClient]);

  return (
    <div className="w-full">
      <div className="sticky top-0 bg-white z-50">
        <div className="flex items-center justify-between px-5 py-4">
          <TextLogo />
          <button
            onClick={() => setIsCheerOpen(true)}
            className="flex items-center gap-1 p-1.5 rounded-full hover:bg-[#412A2A]/5 transition-colors"
            aria-label="응원 알림 열기"
          >
            <SideBarHeartIcon fill={false} />
          </button>
        </div>
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div>
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

      <AnimatePresence>
        {isCheerOpen && (
          <Drawer title="응원" onClose={() => setIsCheerOpen(false)}>
            <Notifications />
          </Drawer>
        )}
      </AnimatePresence>
    </div>
  );
}
