"use client";

import { useDraftPostStore } from "@/store/CreatePostStore";
import { categories, categoryImages } from "@/types/Categories";
import { CategoryCharCount, CategoryCount } from "@/types/Post";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/types/Categories";

import LiveActivityTicker from "@/features/home/LiveActivityTicker";

export function MyCategorys({
  myCategories,
  categoryCounts,
  weeklyCategoryCounts,
  categoryCharCounts = [],
}: {
  myCategories: string[];
  categoryCounts: CategoryCount[];
  weeklyCategoryCounts: CategoryCount[];
  categoryCharCounts?: CategoryCharCount[];
}) {
  const pathname = usePathname();
  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();
  const createPostPath = pathname.startsWith("/m/")
    ? "/m/post/create"
    : "/post/create";
  const categorysData = myCategories.map((cat) => {
    const countData = categoryCounts.find((i) => i.category == cat);
    const charCountData = categoryCharCounts.find((i) => i.category == cat);
    const weeklyCountData = weeklyCategoryCounts.find((i) => i.category == cat);

    return {
      category: cat,
      count: Number(countData?.count ?? 0),
      charCount: Number(charCountData?.characterCount ?? 0),
      weeklyCount: Number(weeklyCountData?.count ?? 0),
    };
  }).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.charCount !== a.charCount) return b.charCount - a.charCount;
    return a.category.localeCompare(b.category, "ko");
  });

  const handleCategoryClick = (cat: { category: string; count: number }) => {
    resetPost();
    setPost({
      category: categories.find((i) => i === cat.category),
      categoryCount: cat.count,
    });
  };

  return (
    <div className="flex flex-col w-full pb-0 overflow-hidden">
      {/* 상단 타이틀 구역 */}
      <div className="flex items-center justify-between px-5 sm:px-9 mt-8 sm:mt-12 mb-6">
        <h1 className="text-[20px] sm:text-[24px] font-bold leading-[31px] text-black tracking-tight">
          오늘의 운동 기록
        </h1>
        <Link
          href="/categories"
          className="flex items-center justify-center px-4 py-1.5 bg-white rounded-full border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          종목 설정
        </Link>
      </div>

      {/* 종목 빠른 기록 영역 */}
      <div className="w-full overflow-x-auto pl-5 pr-0 pb-4 sm:px-9 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex min-w-max items-start gap-4 pr-5 sm:gap-5 sm:pr-0">
          {/* 내 종목 카드들 */}
          {categorysData.map((cat) => {
            const imageSrc = categoryImages[cat.category as Category];
            const hasAnyPost = cat.count > 0;
            const isActiveThisWeek = cat.weeklyCount > 0;
            const ringClass = hasAnyPost
                ? "from-[#8A4314] via-[#D96B2B] to-[#F6C37B]"
                : "from-[#8A94A3] to-[#E2E8F0]";
            const badgeLabel = hasAnyPost
              ? `🔥 ${cat.count}`
              : "New";
            return (
              <Link
                key={cat.category}
                href={createPostPath}
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center gap-2.5 group cursor-pointer w-[76px] sm:w-[92px]"
              >
                <div
                  className={`relative flex items-center justify-center w-[76px] h-[76px] sm:w-[92px] sm:h-[92px] rounded-full bg-gradient-to-br ${ringClass} p-[2.5px] group-hover:scale-105 group-active:scale-95 transition-transform duration-300 shadow-[0_10px_24px_rgba(0,0,0,0.10)]`}
                >
                  <div
                    className={`absolute left-1/2 bottom-0 z-20 -translate-x-1/2 translate-y-[24%] whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-extrabold leading-none shadow-md ring-2 ring-white sm:px-3.5 sm:py-1.5 sm:text-[15px] ${
                      isActiveThisWeek
                        ? "bg-[#FFF2E8] text-[#C75B12]"
                        : "bg-[#F6F7F9] text-[#7C8696]"
                    }`}
                  >
                    {badgeLabel}
                  </div>

                  <div className="relative z-10 flex items-center justify-center w-full h-full bg-[#FCFCFA] rounded-full p-2.5 sm:p-3 shadow-inner">
                    {imageSrc && (
                      <Image
                        src={imageSrc}
                        alt={cat.category}
                        width={60}
                        height={60}
                        className="object-contain w-full h-full drop-shadow-sm"
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="w-full truncate text-[13px] sm:text-[14px] font-semibold text-gray-800 leading-tight text-center">
                    {cat.category}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      {/* 전광판: 카테고리 라벨 바로 아래 */}
      <div className="mt-2">
        <LiveActivityTicker />
      </div>
    </div>
  );
}
