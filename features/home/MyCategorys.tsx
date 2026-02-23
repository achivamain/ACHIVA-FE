"use client";

import { useDraftPostStore } from "@/store/CreatePostStore";
import {
  categories,
  categoryImages,
  categoryImageHeights,
} from "@/types/Categories";
import { CategoryCharCount, CategoryCount } from "@/types/Post";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types/Categories";
import { inter } from "@/lib/fonts";

export function MyCategorys({
  myCategories,
  categoryCounts,
  categoryCharCounts = [],
}: {
  myCategories: string[];
  categoryCounts: CategoryCount[];
  categoryCharCounts?: CategoryCharCount[];
}) {
  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();
  const categorysData = myCategories.map((cat) => {
    const countData = categoryCounts.find((i) => i.category == cat);
    const charCountData = categoryCharCounts.find((i) => i.category == cat);

    return {
      category: cat,
      count: countData?.count ?? 0,
      charCount: charCountData?.characterCount ?? 0,
    };
  });

  const handleCategoryClick = (cat: { category: string; count: number }) => {
    resetPost();
    setPost({
      category: categories.find((i) => i === cat.category),
      categoryCount: cat.count,
    });
  };

  return (
    <div className="flex flex-col w-full pb-8 sm:pb-12">
      {/* 모바일: 타이틀 */}
      <h1 className="text-[26px] font-semibold leading-[31px] text-black mx-9 mt-12 mb-8 sm:hidden">
        운동 일지 작성하기
      </h1>

      {/* 모바일 레이아웃 */}
      <div className="flex flex-col px-5 sm:hidden">
        <div className="grid grid-cols-2 gap-[14px]">
          {categorysData.map((cat) => {
            const imageSrc = categoryImages[cat.category as Category];
            const imageHeight = categoryImageHeights[cat.category as Category];
            const imageWidth = Math.round(
              (imageSrc.width / imageSrc.height) * imageHeight,
            );
            return (
              <Link
                key={cat.category}
                href="/post/create"
                onClick={() => handleCategoryClick(cat)}
              >
                <div
                  className="h-[164px] bg-white border border-[#F3F4F6]
                  rounded-[16px] shadow-[4px_4px_10px_rgba(51,38,174,0.04)]
                  flex flex-col items-center pt-[27px]
                  active:shadow-[4px_4px_10px_rgba(51,38,174,0.12)]
                  transition-all duration-200"
                >
                  <div className="h-[44px] flex items-end justify-center">
                    {imageSrc && (
                      <Image
                        src={imageSrc}
                        alt={cat.category}
                        width={imageWidth}
                        height={imageHeight}
                        className="object-contain"
                        style={{
                          height: Math.min(imageHeight, 44),
                          width: "auto",
                        }}
                      />
                    )}
                  </div>
                  <span className="font-medium text-[17px] leading-[20px] text-black mt-[12px]">
                    {cat.category}
                  </span>
                  <div
                    className={`w-full px-[19px] mt-auto pb-[4px] ${inter.className}`}
                  >
                    <p className="font-medium text-[17px] leading-[22px] text-[#1C2A53]">
                      {cat.count > 0
                        ? `${cat.count}번째 이야기🔥`
                        : `새로운 이야기`}
                    </p>
                    <p className="font-medium text-[13px] leading-[22px] text-[#8E95A9]">
                      {`${cat.charCount}자 기록`}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <Link
          href="/categories"
          className="flex items-center justify-center
          w-[192px] h-[35px] mt-5 bg-white rounded-[20px] border border-[#D9D9D9]
          shadow-[4px_4px_10px_rgba(51,38,174,0.04)]
          font-medium text-[18px] leading-[21px] text-[#412A2A]"
        >
          새로운 종목 추가
        </Link>
      </div>

      {/* PC 레이아웃 */}
      <div className="hidden sm:flex sm:flex-col sm:px-5 sm:mt-[36px]">
        <div className="w-[768px]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[26px] font-semibold leading-[31px] text-black">
              운동 일지 작성하기
            </h1>
            <Link
              href="/categories"
              className="flex items-center justify-center
            w-[192px] h-[35px] bg-white rounded-[20px] border border-[#D9D9D9]
            font-medium text-[18px] leading-[21px] text-[#412A2A]
            hover:bg-[#F3F4F6] transition-colors"
            >
              새로운 종목 추가
            </Link>
          </div>
          <div className="flex flex-wrap gap-[12px]">
            {categorysData.map((cat) => {
              const imageSrc = categoryImages[cat.category as Category];
              return (
                <Link
                  key={cat.category}
                  href="/post/create"
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div
                    className={`w-[248px] h-[311px] bg-white border border-[#F3F4F6]
                  rounded-[16px] shadow-[0px_4px_32px_rgba(51,38,174,0.04)]
                  flex flex-col cursor-pointer
                  hover:shadow-[0px_8px_40px_rgba(51,38,174,0.12)] hover:-translate-y-1
                  transition-all duration-200 ${inter.className}`}
                  >
                    <div className="flex-1 flex flex-col items-center justify-center">
                      {imageSrc && (
                        <Image
                          src={imageSrc}
                          alt={cat.category}
                          width={76}
                          height={69}
                          className="w-[76px] h-[69px] object-contain"
                        />
                      )}
                      <span className="font-bold text-[20px] leading-[30px] text-[#1C2A53] mt-3">
                        {cat.category}
                      </span>
                    </div>

                    <div className="px-5 pb-[28px]">
                      <p className="font-medium text-[21px] leading-[22px] text-[#1C2A53]">
                        {cat.count > 0
                          ? `${cat.count}번째 이야기`
                          : `새로운 이야기`}
                      </p>
                      <p className="font-medium text-[16px] leading-[22px] text-[#8E95A9] mt-[7px]">
                        {`${cat.charCount}자 기록`}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
