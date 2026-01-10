// pc용 - use client를 위한...
"use client";

import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import { useEffect, useState } from "react";
import { MobileWriting } from "./Writing";
import ImageUploader from "./ImageUploader";
import TitleEditor from "./TitleEditor";

import ModalWithoutCloseBtn from "@/components/ModalWithoutCloseBtn";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/MobileHeader";

export default function MobileCreatePostPage() {
  const router = useRouter();
  const currentStep = useCreatePostStepStore.use.currentStep();
  const handlePrevStep = useCreatePostStepStore.use.handlePrevStep();
  const resetStep = useCreatePostStepStore.use.resetStep();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // 글쓰기 버튼 클릭 시 작성상태 리셋
  useEffect(() => {
    resetStep();
  }, [resetStep]);

  let headerTitle: string = "";
  let title: React.ReactNode;
  let content: React.ReactNode;
  switch (currentStep) {
    case 0:
      content = (
        <div>
          <MobileWriting />
        </div>
      );
      break;

    case 1:
      headerTitle = "사진 추가";
      content = (
        <div className="px-5">
          <ImageUploader />
        </div>
      );
      break;

    case 2:
      headerTitle = "표지 미리보기";
      content = (
        <div className="px-5">
          <TitleEditor />
        </div>
      );
      break;

    default:
      title = "에러";
      content = null;
  }
  return (
    <div className="h-full flex-1 flex flex-col">
      {currentStep > 0 ? (
        <div className="flex-shrink-0">
          <MobileHeader onClick={handlePrevStep}>
            {headerTitle ?? null}
          </MobileHeader>
        </div>
      ) : (
        <div className="flex-shrink-0">
          <MobileHeader onClick={router.back}>
            {headerTitle ?? null}
          </MobileHeader>
        </div>
      )}

      <div className="w-full flex-1 flex flex-col pb-15">
        {title && (
          <h1 className="text-xl font-semibold mb-5 flex-shrink-0">{title}</h1>
        )}
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
