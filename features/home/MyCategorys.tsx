"use client";

import { useDraftPostStore } from "@/store/CreatePostStore";
import { categories, categoryImages } from "@/types/Categories";
import { CategoryCharCount, CategoryCount } from "@/types/Post";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/types/Categories";
import { createDefaultPostPages } from "@/lib/postDefaults";

export function MyCategorys({
  categoryCounts,
  weeklyCategoryCounts,
  categoryCharCounts = [],
}: {
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

  const totalRecords = categoryCounts.reduce(
    (acc, curr) => acc + Number(curr.count ?? 0),
    0
  );

  const categorysData = categories.map((cat) => {
    // 기존 데이터(일반, 기도 등)는 아직 합산하지 않고, 우선 새 카테고리 3개 기준으로 분리합니다.
    const countData = categoryCounts.find((i) => i.category === cat);
    const charCountData = categoryCharCounts?.find((i) => i.category === cat);
    const weeklyCountData = weeklyCategoryCounts.find((i) => i.category === cat);

    return {
      category: cat,
      count: Number(countData?.count ?? 0),
      charCount: Number(charCountData?.characterCount ?? 0),
      weeklyCount: Number(weeklyCountData?.count ?? 0),
    };
  });

  const handleCategoryClick = (cat: { category: string; count: number }) => {
    const selectedCategory = categories.find((i) => i === cat.category);

    resetPost();
    setPost({
      category: selectedCategory,
      categoryCount: cat.count,
      title: "",
      pages: createDefaultPostPages(selectedCategory),
    });
  };

  return (
    <section className="mx-5 sm:mx-auto sm:w-full sm:max-w-[640px]">
      <div className="flex w-full min-w-0 flex-col rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm sm:px-5 sm:py-6">
        <div className="mb-4 -mt-2 flex items-center justify-between">
          <div>
            <h3 className="text-[18px] font-bold tracking-tight text-[#4A433D]">
              오늘의 은혜 기록 쓰기
            </h3>
            <p className="mt-1 text-[12px] font-medium text-[#9D8F83]">
              카테고리를 고르면 바로 글쓰기가 시작돼요
            </p>
          </div>
          <Link
            href={createPostPath}
            onClick={resetPost}
            className="flex items-center justify-center rounded-full bg-[#D96B2B] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#c75d20]"
          >
            {totalRecords === 0
              ? "지금 첫 은혜 쓰기"
              : `${totalRecords + 1}번째 은혜 쓰기`}
          </Link>
        </div>

        {categorysData.length === 0 ? (
          <div className="rounded-2xl bg-[#F9F6F2] px-5 py-8 text-center">
            <p className="text-sm font-semibold text-[#4A433D]">
              아직 기록된 카테고리가 없어요.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#8A817A]">
              첫 기록을 남기면 여기에서 카테고리별로 바로 이어서 작성할 수
              있어요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-2">
            {categorysData.map((cat) => {
              const imageSrc = categoryImages[cat.category as Category];
              const hasAnyPost = cat.count > 0;
              
              // 뱃지 내용
              const badgeLabel = hasAnyPost ? `🔥 ${cat.count}` : "New";

              return (
                <Link
                  key={cat.category}
                  href={createPostPath}
                  onClick={() => handleCategoryClick(cat)}
                  className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="relative flex w-full flex-col items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-[#E5C9C9] to-white p-3 shadow-sm ring-1 ring-black/5 aspect-[3/4]">
                    {/* Badge */}
                    <div className="absolute right-1 top-1 z-20 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-[#A87373] shadow-sm ring-1 ring-white/50 backdrop-blur-sm sm:text-[12px]">
                      {badgeLabel}
                    </div>

                    {/* Image */}
                    <div className="relative mt-1 flex h-[55%] w-full items-center justify-center">
                      {imageSrc && (
                        <Image
                          src={imageSrc}
                          alt={cat.category}
                          fill
                          className="object-contain drop-shadow-md scale-[1.4]"
                        />
                      )}
                    </div>

                    {/* Label */}
                    <span className="mt-auto w-full text-center text-[13px] font-bold leading-tight text-[#4A433D] sm:text-[15px]">
                      {cat.category}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
