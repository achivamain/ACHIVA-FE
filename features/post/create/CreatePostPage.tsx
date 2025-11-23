// pc용 - use client를 위한...
"use client";

import BookSelector from "./BookSelector";
import CreateBookPage from "./CreateBookPage";
import CategorySelector from "./CategorySelector";
import SubtitlesSelector from "./SubtitlesSelector";
import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import Modal from "@/components/Modal";
import { useEffect, useState } from "react";
import BgColorSelector from "./BgColorSelector";
import Writing from "./Writing";
import ImageUploader from "./ImageUploader";
import TitleEditor from "./TitleEditor";
import ModalWithoutCloseBtn from "@/components/ModalWithoutCloseBtn";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
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

  let title: React.ReactNode = (
    <div className="h-7 flex items-center justify-center">
      {/* 자리 비움 */}
    </div>
  );
  let content: React.ReactNode;
  let size: string = "";
  switch (currentStep) {
    case 2:
      title = "작성할 이야기를 선택해주세요";
      content = (
        <div className="flex items-center justify-center mt-8 ml-4">
          <BookSelector />
        </div>
      );
      size = "w-2xl flex items-center justify-center mt-8";
      break;

    case 0:
      title = "성취 카테고리를 선택해주세요";
      content = (
        <div className="w-lg h-[20rem] mt-8 flex">
          <CategorySelector />
        </div>
      );
      size = "w-lg h-[20rem] mt-8 flex";
      break;

    case 1:
      title = "표지 미리보기";
      content = (
        <div>
          <CreateBookPage />
        </div>
      );
      size = "w-lg h-[32rem] mt-8";
      break;

    case 3:
      title = "작성할 내용들을 선택해주세요";
      content = (
        <div className="h-120">
          <SubtitlesSelector />
        </div>
      );
      break;

    case 4:
      title = "배경색을 선택해주세요";
      content = (
        <div className="h-100">
          <BgColorSelector />
        </div>
      );
      break;

    case 5:
      content = (
        <div>
          <Writing />
        </div>
      );
      break;

    case 6:
      title = "사진 추가";
      content = <ImageUploader />;
      break;

    case 7:
      title = "표지 미리보기";
      content = <TitleEditor />;
      break;

    default:
      title = "에러";
      content = null;
  }
  return (
    <>
      <Modal
        onClose={() => setIsCloseModalOpen(true)}
        title={
          typeof title === "string" ? (
            <h2 className="text-center font-semibold">{title}</h2>
          ) : (
            title
          )
        }
      >
        {/*currentStep !== 0 && currentStep !== 2 && (
          <button className="absolute top-8 left-8" onClick={handlePrevStep}>
            <svg
              width="12"
              height="22"
              viewBox="0 0 12 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7083 20.2931C11.8012 20.386 11.8749 20.4963 11.9252 20.6177C11.9755 20.7391 12.0013 20.8692 12.0013 21.0006C12.0013 21.132 11.9755 21.2621 11.9252 21.3835C11.8749 21.5048 11.8012 21.6151 11.7083 21.7081C11.6154 21.801 11.5051 21.8747 11.3837 21.9249C11.2623 21.9752 11.1322 22.0011 11.0008 22.0011C10.8694 22.0011 10.7393 21.9752 10.6179 21.9249C10.4965 21.8747 10.3862 21.801 10.2933 21.7081L0.293286 11.7081C0.20031 11.6152 0.126551 11.5049 0.0762272 11.3835C0.0259029 11.2621 0 11.132 0 11.0006C0 10.8691 0.0259029 10.739 0.0762272 10.6176C0.126551 10.4962 0.20031 10.3859 0.293286 10.2931L10.2933 0.293056C10.4809 0.105415 10.7354 -5.23096e-09 11.0008 0C11.2662 5.23096e-09 11.5206 0.105415 11.7083 0.293056C11.8959 0.480697 12.0013 0.735192 12.0013 1.00056C12.0013 1.26592 11.8959 1.52042 11.7083 1.70806L2.41454 11.0006L11.7083 20.2931Z"
                fill="#343330"
              />
            </svg>
          </button>
        )*/}

        {size !== "" ? (
          <div>{content}</div>
        ) : (
          <div className="w-lg mt-8">{content}</div>
        )}
      </Modal>
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
    </>
  );
}
