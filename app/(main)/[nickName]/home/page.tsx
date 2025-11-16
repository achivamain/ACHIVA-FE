"use client";

import Footer from "@/components/Footer";
import Banner from "@/features/event/Banner";
import { BookSection } from "@/features/home/BookSection";

export default function Page() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full flex flex-1 flex-row">
        <div className="flex h-full w-full flex-col">
          <BookSection />
          <div>{/*<GoalSummery/> */}</div>
        </div>
        <div className=" bg-[#fafafa] w-60 md:flex justify-center shrink-0">
          <Banner />
        </div>
      </div>
      <Footer />
    </div>
  );
}
