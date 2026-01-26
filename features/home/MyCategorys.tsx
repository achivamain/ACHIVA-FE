"use client";

import { CaretLeftIcon } from "@/components/Icons";
import { useDraftPostStore } from "@/store/CreatePostStore";
import { categories } from "@/types/Categories";
import { CategoryCount } from "@/types/Post";
import Link from "next/link";
import { CategoryCard } from "../category/CategoryCard";

export function MyCategorys({
  myCategories,
  categoryCounts,
  categoryCharCounts = [],
}: {
  myCategories: string[];
  categoryCounts: CategoryCount[];
  categoryCharCounts?: CategoryCount[];
}) {
  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();
  const categorysData = myCategories.map((cat) => {
    const countData = categoryCounts.find((i) => i.category == cat);
    const charCountData = categoryCharCounts.find((i) => i.category == cat);

    return {
      category: cat,
      count: countData?.count ?? 0,
      charCount: charCountData?.count ?? null,
    };
  });

  return (
    <div className="flex w-full flex-col pb-4">
      <h1 className="pt-4 text-[26px] font-semibold m-4 px-1 mb-1">
        운동 일지 작성하기
      </h1>
      <div className="flex w-full h-full flex-col px-4 my-1">
        {categorysData.map((cat) => (
          <div
            key={cat.category}
            className="flex justify-between w-full h-26 bg-white rounded-md my-1 px-4 border-0 border-[#E4E4E4] md:border"
          >
            <CategoryCard name={cat.category} />
            <div className="flex flex-1 flex-col px-8 justify-center">
              <span className="font-semibold text-[18px]">
                {cat.count > 0 ? `${cat.count}번째 이야기🔥` : `새로운 이야기`}
              </span>
              <span className="text-[#808080] text-[15px]">
                {cat.charCount ? `${cat.charCount}글자` : "\u00A0"}
                {/* 데이터가 없을 때는 빈칸으로 표시 */}
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
        <button className="w-50 mx-4 bg-white rounded-full border border-[#D9D9D9] p-1 font-medium text-[#412A2A] text-[18px]">
          새로운 운동 작성
        </button>
      </Link>
    </div>
  );
}
