"use client";

import { CaretLeftIcon } from "@/components/Icons";
import { useDraftPostStore } from "@/store/CreatePostStore";
import { categories } from "@/types/Categories";
import { CategoryCharCount, CategoryCount } from "@/types/Post";
import Link from "next/link";
import { CategoryCard } from "../category/CategoryCard";
import { Category } from "@/types/Categories";

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

  return (
    <div className="flex flex-col w-full gap-5 pb-8 sm:pb-12">
      <h1 className="text-[26px] font-semibold mx-5 mt-8 sm:mb-4">
        운동 일지 작성하기
      </h1>
      <div className="flex flex-col gap-2 w-full h-full px-5">
        {categorysData.map((cat) => (
          <div
            key={cat.category}
            className="flex justify-between w-full h-26 px-4
              bg-white border-0 border-[#E4E4E4] rounded-[10px] md:border"
          >
            <CategoryCard background={false} name={cat.category as Category} />
            <div className="flex flex-1 flex-col px-8 justify-center">
              <span className="font-semibold text-[18px]">
                {cat.count > 0 ? `${cat.count}번째 이야기🔥` : `새로운 이야기`}
              </span>
              <span className="text-[#808080] text-[15px]">
                {`${cat.charCount}글자`}
              </span>
            </div>
            <button
              className="flex"
              onClick={() => {
                resetPost();
                setPost({
                  category: categories.find((i) => i === cat.category),
                  categoryCount: cat.count,
                });
              }}
            >
              <Link
                className="h-full flex flex-col justify-center item-center"
                href="/post/create"
              >
                <CaretLeftIcon />
              </Link>
            </button>
          </div>
        ))}
      </div>
      <Link href={"/categories"}>
        <button className="w-50 font-medium text-[#412A2A] text-[18px] mx-7 p-1 bg-white rounded-full border border-[#D9D9D9] sm:mt-2">
          새로운 운동 작성
        </button>
      </Link>
    </div>
  );
}
