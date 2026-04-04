"use client";

import { useDraftPostStore } from "@/store/CreatePostStore";
import { categories, categoryImages } from "@/types/Categories";
import { CategoryCharCount, CategoryCount } from "@/types/Post";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/types/Categories";

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

  const categorysData = myCategories
    .map((cat) => {
      const countData = categoryCounts.find((i) => i.category == cat);
      const charCountData = categoryCharCounts.find((i) => i.category == cat);
      const weeklyCountData = weeklyCategoryCounts.find(
        (i) => i.category == cat,
      );

      return {
        category: cat,
        count: Number(countData?.count ?? 0),
        charCount: Number(charCountData?.characterCount ?? 0),
        weeklyCount: Number(weeklyCountData?.count ?? 0),
      };
    })
    .sort((a, b) => {
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
    <section className="mx-5 sm:mx-auto sm:w-full sm:max-w-[640px]">
      <div className="flex w-full min-w-0 flex-col rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
        <div className="mb-4 -mt-2 flex items-center justify-between">
          <h3 className="text-[18px] font-bold tracking-tight text-[#4A433D]">
            오늘의 운동 기록
          </h3>
          <Link
            href="/categories"
            className="flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-1.5 text-[13px] font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            종목 설정
          </Link>
        </div>

        <div className="overflow-x-auto pb-1 -mx-4 sm:-mx-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex min-w-max items-start gap-4 pr-1 px-4 sm:px-5 sm:gap-5">
            {categorysData.map((cat) => {
              const imageSrc = categoryImages[cat.category as Category];
              const hasAnyPost = cat.count > 0;
              const isActiveThisWeek = cat.weeklyCount > 0;
              const ringClass = hasAnyPost
                ? "from-[#8A4314] via-[#D96B2B] to-[#F6C37B]"
                : "from-[#8A94A3] to-[#E2E8F0]";
              const badgeLabel = hasAnyPost ? `🔥 ${cat.count}` : "New";

              return (
                <Link
                  key={cat.category}
                  href={createPostPath}
                  onClick={() => handleCategoryClick(cat)}
                  className="group flex w-[76px] cursor-pointer flex-col items-center gap-3 sm:w-[92px]"
                >
                  <div
                    className={`relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-br ${ringClass} p-[2.5px] shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 sm:h-[92px] sm:w-[92px]`}
                  >
                    <div
                      className={`absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-[24%] whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-extrabold leading-none shadow-md ring-2 ring-white sm:px-3.5 sm:py-1.5 sm:text-[15px] ${
                        isActiveThisWeek
                          ? "bg-[#FFF2E8] text-[#C75B12]"
                          : "bg-[#F6F7F9] text-[#7C8696]"
                      }`}
                    >
                      {badgeLabel}
                    </div>

                    <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-[#FCFCFA] p-2.5 shadow-inner sm:p-3">
                      {imageSrc && (
                        <Image
                          src={imageSrc}
                          alt={cat.category}
                          width={60}
                          height={60}
                          className="h-full w-full object-contain drop-shadow-sm"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="w-full truncate text-center text-[13px] font-semibold leading-tight text-gray-800 sm:text-[14px]">
                      {cat.category}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
