"use client";

import { CaretLeftIcon } from "@/components/Icons";
import { useDraftPostStore } from "@/store/CreatePostStore";
import { categories } from "@/types/Categories";
import Link from "next/link";

export function MyCategorys({ myCategories }: { myCategories: string[] }) {
  const resetPost = useDraftPostStore.use.resetPost();
  const setPost = useDraftPostStore.use.setPost();
  return (
    <div className="flex w-full flex-col pb-4">
      <h1 className="pt-4 text-[26px] font-semibold m-4 px-1 mb-1">
        운동 일지 작성하기
      </h1>
      <div className="flex w-full h-full flex-col px-4 m-1">
        {myCategories.map((cat) => (
          <div
            key={cat}
            className="flex justify-between w-full h-28 bg-white rounded-md my-1 px-4 py-2"
          >
            <div className="flex flex-col justify-center item-center">
              <div className="h-18 w-18 bg-[#D9D9D9] rounded-md"></div>
              <span className="font-semibold text-[15px] text-center">
                {cat}
              </span>
            </div>
            <div className="flex flex-1 flex-col py-4 px-8 mt-1">
              <span className="font-semibold text-[18px]">{}번째 이야기</span>
              <span className="text-[#808080] text-[15px]">{}글자</span>
            </div>
            <button
              className="flex"
              onClick={() => {
                resetPost();
                setPost({ category: categories.find((i) => i === cat) });
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
      <button>새로운 운동 작성</button>
    </div>
  );
}
