// pc용 - use client를 위한...
"use client";

import CategorySelector from "./CategorySelector";
import SubtitlesSelector from "./SubtitlesSelector";
import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import type { CategoryCount } from "@/types/Post";
import { useEffect, useState } from "react";
import BgColorSelector from "./BgColorSelector";
import { MobileWriting } from "./Writing";
import ImageUploader from "./ImageUploader";
import TitleEditor from "./TitleEditor";
import ModalWithoutCloseBtn from "@/components/ModalWithoutCloseBtn";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/MobileHeader";

export default function MobileCreatePostPage({
  categoryCounts,
}: {
  categoryCounts: CategoryCount[];
}) {
  const router = useRouter();
  const currentStep = useCreatePostStepStore.use.currentStep();
  const handlePrevStep = useCreatePostStepStore.use.handlePrevStep();
  const resetStep = useCreatePostStepStore.use.resetStep();
  const resetPost = useDraftPostStore.use.resetPost();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // 글쓰기 버튼 클릭 시 작성상태 리셋
  useEffect(() => {
    resetStep();
    resetPost();
  }, [resetStep, resetPost]);

  let headerTitle: string = "";
  let title: React.ReactNode;
  let content: React.ReactNode;
  switch (currentStep) {
    case 0:
      title = "작성할 성취 카테고리를 선택해주세요";
      content = (
        <div className="flex-1 flex flex-col">
          <CategorySelector categoryCounts={categoryCounts} />
        </div>
      );
      break;
    case 1:
      title = "작성할 내용들을 선택해주세요";
      content = (
        <div className="flex-1 flex flex-col">
          <SubtitlesSelector />
        </div>
      );
      break;
    case 2:
      title = "배경색을 선택해주세요";
      content = (
        <div className="flex-1 flex flex-col">
          <BgColorSelector />
        </div>
      );
      break;
    case 3:
      content = (
        <div>
          <MobileWriting />
        </div>
      );
      break;
    case 4:
      headerTitle = "사진 추가";
      content = <ImageUploader />;
      break;
    case 5:
      headerTitle = "표지 미리보기";
      content = <TitleEditor />;
      break;
    default:
      title = "에러";
      content = null;
  }
  return (
    <div className="flex-1 flex flex-col">
      <MobileHeader onClick={currentStep !== 0 ? handlePrevStep : undefined}>
        {headerTitle ?? null}
      </MobileHeader>
      <div className="w-full flex-1 flex flex-col px-5 pb-15">
        {title && <h1 className="text-xl font-semibold mb-5">{title}</h1>}
        {content}
      </div>
      {isCloseModalOpen && (
        <ModalWithoutCloseBtn
          title={<p className="w-xs">글쓰기를 중단하시겠어요?</p>}
          onClose={() => setIsCloseModalOpen(false)}
        >
          <li
            className="py-2 cursor-pointer text-[#DF171B] font-semibold"
            onClick={router.back}
          >
            삭제
          </li>
          <li
            className="py-2 cursor-pointer"
            onClick={() => setIsCloseModalOpen(false)}
          >
            계속 수정하기
          </li>
        </ModalWithoutCloseBtn>
      )}
    </div>
  );
}
