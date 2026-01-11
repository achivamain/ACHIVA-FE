"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import FeedTabs, { type FeedTab } from "@/features/feed/FeedTabs";
import FeedList from "@/features/feed/FeedList";
import { TextLogo } from "@/components/Logo";

export default function MobileFeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>("전체");

  return (
    <div className="w-full flex-1 flex flex-col pb-22">
      <div className="sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between px-5 py-4">
          <TextLogo />
        </div>
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex-1">
        <FeedList activeTab={activeTab} />
      </div>

      <Footer />
    </div>
  );
}


