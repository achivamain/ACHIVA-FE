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
}: {
  myCategories: string[];
  categoryCounts: CategoryCount[];
}) {
  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();
  const categorysData = categoryCounts.filter((i) => myCategories.includes(i.category))

  return (
    <div className="flex w-full flex-col pb-4">
      <h1 className="pt-4 text-[26px] font-semibold m-4 px-1 mb-1">
        운동 일지 작성하기
      </h1>
      <div className="flex w-full h-full flex-col px-4 m-1">
        {categorysData.map((cat) => (
          <div
            key={cat.category}
            className="flex justify-between w-full h-28 bg-white rounded-md my-1 px-4"
          >
            <CategoryCard name={cat.category}/>
            <div className="flex flex-1 flex-col px-8 justify-center">
              <span className="font-semibold text-[18px]">{cat.count > 0 ? `${cat.count}번째 이야기🔥` : `새로운 이야기`}</span>
              <span className="text-[#808080] text-[15px]">{cat.count > 0 ? `` : `0`}글자</span>
            </div>
            <button
              className="flex"
              onClick={() => {
                resetPost();
                setPost({ category: categories.find((i) => i === cat.category), categoryCount: cat.count });
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
      <Link href={"/categories"}><button className="w-50 mx-4 bg-white rounded-full border border-[#D9D9D9] p-1 font-medium text-[#412A2A] text-[18px]">새로운 운동 작성</button></Link>
    </div>
  );
}
