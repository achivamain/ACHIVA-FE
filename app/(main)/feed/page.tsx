"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import FeedTabs, {
  defaultFeedTab,
  type FeedTab,
} from "@/features/feed/FeedTabs";
import { LoadingIcon, SideBarHeartIcon } from "@/components/Icons";
import { AnimatePresence } from "motion/react";

const Banner = dynamic(() => import("@/features/event/Banner"), {
  ssr: false,
  loading: () => (
    <div className="sticky top-[135px] mt-[135px] w-[256px] h-[350px] rounded-[10px] bg-gray-100 animate-pulse" />
  ),
});

const FeedList = dynamic(() => import("@/features/feed/FeedList"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex justify-center py-10">
      <LoadingIcon color="text-theme" />
    </div>
  ),
});

const Drawer = dynamic(() => import("@/components/Drawer"), { ssr: false });
const Notifications = dynamic(
  () => import("@/features/user/Notifications"),
  { ssr: false },
);

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>(defaultFeedTab);
  const [isCheerOpen, setIsCheerOpen] = useState(false);

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex-1 flex">
        <div className="mx-auto w-full max-w-140 flex flex-col">
          <div className="sticky top-0 bg-white z-50">
            <div className="flex items-center justify-between px-2 py-3">
              <span />
              <button
                onClick={() => setIsCheerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#412A2A]/20 hover:bg-[#412A2A]/5 transition-colors"
                aria-label="응원 알림 열기"
              >
                <SideBarHeartIcon fill={false} />
                <span className="text-sm font-medium text-theme hidden sm:inline">응원</span>
              </button>
            </div>
            <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="flex-1 px-4">
            <FeedList activeTab={activeTab} />
          </div>
        </div>

        <div className="bg-[#fafafa] w-[320px] hidden md:flex justify-center">
          <Banner />
        </div>
      </div>

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
