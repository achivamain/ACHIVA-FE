"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import FeedTabs, { type FeedTab } from "@/features/feed/FeedTabs";
import { LoadingIcon } from "@/components/Icons";

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

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("전체");

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex-1 flex">
        <div className="mx-auto w-full max-w-140 flex flex-col">
          <div className="sticky top-0 bg-white z-20">
            <div className="flex items-center justify-between px-2 py-3"></div>
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
    </div>
  );
}
