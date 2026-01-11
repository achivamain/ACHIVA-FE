"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import Banner from "@/features/event/Banner";
import FeedTabs, { type FeedTab } from "@/features/feed/FeedTabs";
import FeedList from "@/features/feed/FeedList";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("전체");

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex-1 flex">
        <div className="mx-auto w-full max-w-140 flex flex-col">
          <div className="sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between px-2 py-3">
              {/* 로고 중복이라 비움 -> 디자인 요청 필요 */}
            </div>
            <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="flex-1 px-4">
            <FeedList activeTab={activeTab} />
          </div>
        </div>

        <div className="bg-[#fafafa] w-60 hidden md:flex justify-center">
          <Banner />
        </div>
      </div>
      <Footer />
    </div>
  );
}
