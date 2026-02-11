// 소제목 페이지네이션, 빈 페이지 추가하기 관리
"use client";
import { useState } from "react";
import Slides from "./Slides";
import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import { NextStepButton } from "./Buttons";

export default function Writing() {
  const draft = useDraftPostStore.use.post();
  const handleNextStep = useCreatePostStepStore.use.handleNextStep();
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="absolute top-7 right-17">
        <AddNewPageBtn
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
      <Slides currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <Bullets currentPage={currentPage} />
      {currentPage === draft.pages?.length && (
        <NextStepButton
          disabled={!draft.pages?.every((page) => page.content)}
          onClick={handleNextStep}
        >
          다음
        </NextStepButton>
      )}
    </div>
  );
}

export function MobileWriting() {
  const draft = useDraftPostStore.use.post();
  const handleNextStep = useCreatePostStepStore.use.handleNextStep();
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <div className="flex flex-col justify-between h-full">
      <Slides currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="absolute flex justify-center top-4 left-1/2 -translate-x-1/2 z-99">
        <Bullets currentPage={currentPage} />
      </div>
      <div className="absolute flex justify-center top-112 right-4 z-99 mt-2.5">
        <AddNewPageBtn
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {currentPage !== draft.pages?.length && (
        <button
          className="absolute 
          top-2.5 right-5 z-99 py-1 px-3 
          font-semibold text-white disabled:text-[#808080]
          bg-theme border border-theme rounded-sm
          disabled:bg-white  disabled:border-[#d9d9d9]"
          disabled={!draft.pages?.[currentPage - 1]?.content}
          onClick={() => setCurrentPage((n) => n + 1)}
        >
          다음
        </button>
      )}

      {currentPage === draft.pages?.length && (
        <button
          className="absolute 
          top-2.5 right-5 z-99 py-1 px-3 
          font-semibold text-white disabled:text-[#808080]
          bg-theme border border-theme rounded-sm
          disabled:bg-white  disabled:border-[#d9d9d9]"
          disabled={!draft.pages?.every((page) => page.content)}
          onClick={handleNextStep}
        >
          완료
        </button>
      )}
    </div>
  );
}

type Props = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};

function AddNewPageBtn({ currentPage, setCurrentPage }: Props) {
  const setPost = useDraftPostStore.use.setPost();
  return (
    <button
      onClick={() => {
        setPost((prev) => ({
          ...prev,
          pages: [
            ...prev.pages!.slice(0, currentPage),
            {
              id: crypto.randomUUID(),
              content: "",
            },
            ...prev.pages!.slice(currentPage),
          ],
        }));
        setCurrentPage((prev) => prev + 1);
      }}
      className="py-1 px-3
      font-semibold text-[#808080]
      bg-white border border-[#d9d9d9] rounded-sm"
    >
      빈 페이지 추가하기
    </button>
  );
}

function Bullets({ currentPage }: { currentPage: number }) {
  const draft = useDraftPostStore.use.post();
  const pagesWithSubtitle = draft.pages?.filter((p) => p.subtitle);
  const currentSubtitleIdx =
    (draft.pages?.slice(0, currentPage).filter((p) => p.subtitle).length ?? 0) -
    1;

  return (
    <ol className="flex justify-center gap-1 w-full mt-2 mb-6 ">
      {pagesWithSubtitle?.map((page, idx) => {
        return (
          <li key={page.id}>
            <svg
              width="9"
              height="8"
              viewBox="0 0 9 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="4.12797"
                cy="3.96"
                r="3.96"
                fill={
                  idx === currentSubtitleIdx ? "var(--color-theme)" : "#D9D9D9"
                }
              />
            </svg>
          </li>
        );
      })}
    </ol>
  );
}
