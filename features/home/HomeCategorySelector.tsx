"use client";

import { Category } from "@/types/Categories";
import CategorySelector from "../category/CategorySelector";
import { useState } from "react";
import MobileHeader from "@/components/MobileHeader";
import ModalWithoutCloseBtn from "@/components/ModalWithoutCloseBtn";
import { useRouter } from "next/navigation";

export default function MobileHomeCategorySelector({
  defaultSelectedCategories,
}: {
  defaultSelectedCategories?: Category[];
}) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategory] = useState(
    defaultSelectedCategories
  );
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const selectCategory = (cat: Category) =>
    setSelectedCategory((n) => (n ? [...n, cat] : [cat]));
  const disSelectCategory = (cat: Category) =>
    setSelectedCategory((n) => (n ? n.filter((i) => i !== cat) : []));

  return (
    <div className="w-full h-full">
      <MobileHeader onClick={() => setIsCloseModalOpen(true)}>
        <></>
      </MobileHeader>
      <h1 className="font-semibold text-[24px] px-4">
        기록하고 싶은 운동을 선택해주세요
      </h1>
      <div className="flex w-full h-full px-8 pt-8">
        <CategorySelector
          selectedCategories={selectedCategories}
          selectCategory={selectCategory}
          disSelectCategory={disSelectCategory}
        />
      </div>
      <div className="h-80">{/*하단 여백*/}</div>

      <button className="absolute top-3.5 right-5 z-50 font-semibold text-theme py-[2px] px-3 bg-white border border-[#D9D9D9] rounded-sm">
        저장
      </button>

      {isCloseModalOpen && (
        <ModalWithoutCloseBtn
          title={
            <p className="w-xs">
              저장하지 않으면
              <br />
              변경사항이 사라집니다
            </p>
          }
          onClose={() => setIsCloseModalOpen(false)}
        >
          <li
            className="py-2 cursor-pointer text-theme font-medium"
            onClick={() => setIsCloseModalOpen(false)}
          >
            계속 수정하기
          </li>
          <li
            className="py-2 cursor-pointer text-[#DF171B] font-semibold"
            onClick={router.back}
          >
            나가기
          </li>
        </ModalWithoutCloseBtn>
      )}
    </div>
  );
}
