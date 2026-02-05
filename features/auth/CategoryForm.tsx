"use client";
import { useSignupInfoStore, useSignupStepStore } from "@/store/SignupStore";
import CategorySelector from "@/features/category/CategorySelector";
import { Category } from "@/types/Categories";

export default function CategoryForm() {
  const user = useSignupInfoStore.use.user();
  const setUser = useSignupInfoStore.use.setUser();

  const selectedCategories = user.categories as Category[];

  const selectCategory = (category: Category) => {
    setUser({ categories: [...user.categories, category] });
  };

  const disSelectCategory = (category: Category) => {
    setUser({
      categories: user.categories.filter((c) => c !== category),
    });
  };

  const isOverLimit = user.categories.length > 5;

  return (
    <div className="w-full h-full flex flex-col">
      {/* 제목 영역 */}
      <div className="w-full text-left">
        <p className="font-semibold text-2xl leading-[29px] text-black">
          관심있는 운동을 선택해주세요
        </p>
        <p className="font-light text-[15px] leading-[20px] text-[#808080] mt-2.5 break-keep">
          관심있는 운동을 기록하고, 같은 관심사의 사람들과 서로 응원해요
        </p>
        {/* 에러 메시지 */}
        {isOverLimit && (
          <p className="font-light text-sm text-theme-red mt-2">
            카테고리는 최대 5개만 선택할 수 있습니다
          </p>
        )}
      </div>

      {/* 카테고리 선택 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-20 scrollbar-hide">
        <CategorySelector
          selectedCategories={selectedCategories}
          selectCategory={selectCategory}
          disSelectCategory={disSelectCategory}
        />
      </div>
    </div>
  );
}

// 헤더에 표시할 다음 버튼 컴포넌트
export function CategoryNextButton() {
  const handleNextStep = useSignupStepStore.use.handleNextStep();
  const user = useSignupInfoStore.use.user();
  const isValid = user.categories.length >= 1 && user.categories.length <= 5;

  return (
    <button
      onClick={handleNextStep}
      disabled={!isValid}
      className="font-semibold text-theme py-[2px] px-3 bg-white border border-[#D9D9D9] rounded-sm disabled:text-[#a6a6a6] disabled:border-[#e6e6e6]"
    >
      다음
    </button>
  );
}
