"use client";

import { CaretLeftIcon } from "@/components/Icons";
import { useDraftPostStore } from "@/store/CreatePostStore";
import { categories, categoryImages } from "@/types/Categories";
import { CategoryCharCount, CategoryCount } from "@/types/Post";
import Link from "next/link";
import { CategoryCard } from "../category/CategoryCard";
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
      <h1 className="text-[26px] font-semibold leading-[31px] text-black mx-5 mt-8 mb-3 sm:hidden">
        운동일지 작성하기
      </h1>

      {/* 모바일 레이아웃: 가로형 리스트 */}
      <div className="flex flex-col gap-2 w-full h-full px-5 sm:hidden">
        {categorysData.map((cat) => (
          <div
            key={cat.category}
            className="flex justify-between w-full h-26 px-4
            bg-white border-0 border-[#E4E4E4] rounded-[10px]"
          >
            <CategoryCard
              background={false}
              name={cat.category as Category}
            />
            <div className="flex flex-1 flex-col px-8 justify-center">
              <span className="font-semibold text-[18px]">
                {cat.count > 0
                  ? `${cat.count}번째 이야기🔥`
                  : `새로운 이야기`}
              </span>
              <span className="text-[#808080] text-[15px]">
                {`${cat.charCount}글자`}
              </span>
            </div>
            <button
              className="flex"
              onClick={() => handleCategoryClick(cat)}
            >
              <Link
                className="h-full flex flex-col justify-center items-center"
                href="/post/create"
              >
                <CaretLeftIcon />
              </Link>
            </button>
          </div>
        ))}
        {/* 모바일: 하단 버튼 */}
        <Link href={"/categories"}>
          <button className="w-50 font-medium text-[#412A2A] text-[18px] mx-2 mt-3 p-1 bg-white rounded-full border border-[#D9D9D9]">
            새로운 운동 작성
          </button>
        </Link>
      </div>

      {/* PC 레이아웃: 타이틀 + 버튼 + 카드를 w-fit으로 묶어 정렬 */}
      <div className="hidden sm:flex sm:flex-col sm:px-5 sm:mt-[36px]">
        <div className="w-fit">
          <div className="flex items-center justify-between mb-4  ">
            <h1 className="text-[26px] font-semibold leading-[31px] text-black">
              운동일지 작성하기
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
              const imageSrc =
                categoryImages[cat.category as Category];
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
                        <img
                          src={imageSrc}
                          alt={cat.category}
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
