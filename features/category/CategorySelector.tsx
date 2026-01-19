"use client";

import { Category, groupedCategorys } from "@/types/Categories";
import { CategoryCard } from "./CategoryCard";

type CategorySelectorProps = {
  selectedCategories: Category[] | undefined; //선택중인 카테고리
  selectCategory: (category: Category) => void; //선택 추가
  disSelectCategory: (category: Category) => void; //선택 해제
};

//카테고리 선택기 UI
export default function CategorySelector({
  selectedCategories,
  selectCategory,
  disSelectCategory,
}: CategorySelectorProps) {
  return (
    <div className="flex h-full w-full flex-col gap-5">
      {groupedCategorys.map((group) => (
        <div key={group.groupName} className="flex w-full flex-col">
          <h2 className="font-medium text-[19px] py-2">{group.groupName}</h2>
          <div className="flex flex-wrap w-full gap-3">
            {group.categories.map((cat) => {
              const isSelected = selectedCategories?.includes(cat);

              return (
                <div className="relative" key={cat}>
                  {isSelected && <SelectedIcon />}
                  <button
                    onClick={() =>
                      isSelected ? disSelectCategory(cat) : selectCategory(cat)
                    }
                  >
                    <CategoryCard name={cat}></CategoryCard>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectedIcon() {
  return (
    <div className="absolute right-[-4px] top-[-4px] z-10 bg-[#3398FF] rounded-[100%] p-1 w-[24px] h-[24px]">
      <svg
        width="15"
        height="15"
        viewBox="0 0 20 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.8016 2.65516L7.26314 14.1936C7.16265 14.2945 7.04323 14.3745 6.91175 14.4291C6.78026 14.4837 6.63929 14.5118 6.49692 14.5118C6.35455 14.5118 6.21358 14.4837 6.08209 14.4291C5.9506 14.3745 5.83119 14.2945 5.73069 14.1936L0.682616 9.14554C0.581993 9.04492 0.502175 8.92547 0.447719 8.794C0.393263 8.66253 0.365234 8.52162 0.365234 8.37932C0.365234 8.23702 0.393263 8.09611 0.447719 7.96464C0.502175 7.83317 0.581993 7.71371 0.682616 7.61309C0.783238 7.51247 0.902694 7.43265 1.03416 7.3782C1.16563 7.32374 1.30654 7.29571 1.44884 7.29571C1.59114 7.29571 1.73205 7.32374 1.86352 7.3782C1.99499 7.43265 2.11445 7.51247 2.21507 7.61309L6.49782 11.8958L17.271 1.12451C17.4742 0.921294 17.7498 0.807129 18.0372 0.807129C18.3246 0.807129 18.6002 0.921294 18.8034 1.12451C19.0066 1.32773 19.1208 1.60335 19.1208 1.89074C19.1208 2.17813 19.0066 2.45375 18.8034 2.65696L18.8016 2.65516Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}
