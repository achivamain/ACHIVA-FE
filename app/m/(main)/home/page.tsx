"use client";
import Footer from "@/components/Footer";
import HomeSection1 from "@/features/home/Section1";
import HomeSection2 from "@/features/home/Section2";

export default function Page() {
  return (
    <div className="w-full flex-1 flex flex-col pb-22">
      <div className="flex-1 flex flex-col gap-5 w-full px-4">
        <HomeSection1 />
        <HomeSection2 />
      </div>
      <Footer />
    </div>
  );
}
