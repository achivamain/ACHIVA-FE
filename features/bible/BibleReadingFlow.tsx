"use client";

import { startTransition, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BackIcon } from "@/components/Icons";
import { usePathname, useRouter } from "next/navigation";
import {
  bibleBooks,
  featuredBookIds,
  type ScriptureMeta,
  type Testament,
} from "@/features/bible/mockData";
import { createScriptureReadingArticle } from "@/features/bible/api";
import { useScriptureProgress } from "@/features/bible/hooks/useScriptureProgress";

type BibleReadingFlowProps = {
  nickName: string;
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function BookButton({
  book,
  isFeatured,
  onSelect,
}: {
  book: ScriptureMeta;
  isFeatured: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-[88px] flex-col items-start justify-between rounded-[20px] border px-4 py-3 text-left transition-all duration-200",
        "shadow-sm hover:shadow-md hover:-translate-y-0.5",
        isFeatured
          ? "border-[#F3D5C0] bg-[#FFF8F3]"
          : "border-gray-100 bg-white",
      )}
    >
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em]",
          isFeatured
            ? "bg-[#FFF4EC] text-[#D96B2B]"
            : "bg-[#F5F3F0] text-[#8A817A]",
        )}
      >
        {book.testament === "old" ? "구약" : "신약"}
      </span>
      <div>
        <p className="text-[16px] font-bold text-[#4A433D]">{book.name}</p>
        <p className="mt-1 text-[12px] text-[#8A817A]">{book.totalChapters}장</p>
      </div>
    </button>
  );
}

function ChapterDot({
  chapter,
  state,
  onClick,
  disabled,
}: {
  chapter: number;
  state: "completed" | "selected" | "default";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${chapter}장`}
      className={cn(
        "h-5 w-5 rounded-full border transition-all duration-200 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100",
        state === "completed" && "border-[#D96B2B] bg-[#D96B2B] shadow-sm",
        state === "selected" && "border-[#D96B2B] bg-[#FFF4EC] shadow-sm",
        state === "default" && "border-[#E5DDD4] bg-white",
      )}
    />
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-gray-100 bg-white px-3.5 py-3 shadow-sm">
      <p className="text-[11px] font-medium text-[#8A817A]">{label}</p>
      <p className="mt-1 text-[22px] font-black text-[#4A433D]">{value}</p>
    </div>
  );
}

export default function BibleReadingFlow({
  nickName,
}: BibleReadingFlowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const safeBibleBooks = Array.isArray(bibleBooks) ? bibleBooks : [];
  const safeFeaturedBookIds = Array.isArray(featuredBookIds)
    ? featuredBookIds
    : [];
  const {
    progress,
    updateScriptureProgress,
    isLoading: isProgressLoading,
    isSaving: isProgressSaving,
  } = useScriptureProgress();

  const [currentStep, setCurrentStep] = useState<"select" | "record">("select");
  const [activeTestament, setActiveTestament] = useState<Testament>("new");
  const [selectedBookId, setSelectedBookId] = useState("요한복음");
  const [shareContent, setShareContent] = useState("");
  const [draftEndChapterByScriptureId, setDraftEndChapterByScriptureId] = useState<
    Record<string, number | null>
  >({});
  const [shareSuccessMessage, setShareSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBook =
    safeBibleBooks.find((book) => book.id === selectedBookId) ??
    safeBibleBooks[0];

  if (!selectedBook) {
    return (
      <div className="flex w-full justify-center bg-[#FAFAFA] px-3 pb-24 pt-4 sm:px-6 sm:pb-16 sm:pt-8">
        <div className="w-full max-w-[460px] rounded-[24px] border border-gray-100 bg-white px-5 py-8 text-center shadow-sm">
          <p className="text-[18px] font-bold text-[#4A433D]">
            성경 목록을 불러오지 못했습니다.
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[#8A817A]">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>
      </div>
    );
  }

  const completedCount = Math.min(
    selectedBook.totalChapters,
    Math.max(0, progress.completedByScriptureId[selectedBook.id] ?? 0),
  );
  const nextUnreadChapter = Math.min(
    selectedBook.totalChapters,
    completedCount + 1,
  );
  const selectedEndChapter = draftEndChapterByScriptureId[selectedBook.id] ?? null;
  const selectedRange =
    selectedEndChapter && selectedEndChapter >= nextUnreadChapter
      ? { start: nextUnreadChapter, end: selectedEndChapter }
      : null;
  const progressPercent = Math.round(
    (completedCount / selectedBook.totalChapters) * 100,
  );
  const isCompleted = completedCount === selectedBook.totalChapters;
  const isMobilePath = pathname.startsWith("/m/");

  const booksInTab = safeBibleBooks.filter(
    (book) => book.testament === activeTestament,
  );

  const rangePreviewText = useMemo(() => {
    if (isCompleted) {
      return `${selectedBook.name} 기록을 모두 완료했습니다.`;
    }

    if (!selectedRange) {
      return `다음 기록은 ${selectedBook.name} ${nextUnreadChapter}장부터 시작합니다.`;
    }

    return `${selectedBook.name} ${selectedRange.start}장 - ${selectedRange.end}장`;
  }, [isCompleted, nextUnreadChapter, selectedBook.name, selectedRange]);

  const handleSelectTestament = (testament: Testament) => {
    startTransition(() => {
      setActiveTestament(testament);
    });
  };

  const handleSelectBook = (book: ScriptureMeta) => {
    startTransition(() => {
      setSelectedBookId(book.id);
      setCurrentStep("record");
      setShareSuccessMessage("");
      setSubmitError("");
    });
  };

  const handleSelectEndChapter = (chapter: number) => {
    if (chapter <= completedCount || isCompleted) return;

    startTransition(() => {
      setDraftEndChapterByScriptureId((current) => ({
        ...current,
        [selectedBook.id]: chapter,
      }));
      setShareSuccessMessage("");
      setSubmitError("");
    });
  };

  const handleShareToFeed = async () => {
    if (!selectedRange || !shareContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await createScriptureReadingArticle({
        scriptureId: selectedBook.id,
        startChapter: selectedRange.start,
        endChapter: selectedRange.end,
        completedChapters: selectedRange.end,
        content: shareContent.trim(),
      });

      await updateScriptureProgress(selectedBook.id, selectedRange.end);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed", "성경 일독"] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "오늘 은혜"] }),
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
      ]);

      setShareContent("");
      setDraftEndChapterByScriptureId((current) => ({
        ...current,
        [selectedBook.id]: null,
      }));
      setShareSuccessMessage(
        `${selectedBook.name} ${selectedRange.start}장부터 ${selectedRange.end}장까지 기록을 남겼어요.`,
      );
    } catch (error) {
      console.error(error);
      setSubmitError("기록 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === "record") {
      setCurrentStep("select");
      return;
    }

    router.push(`${isMobilePath ? "/m" : ""}/${encodeURIComponent(nickName)}/home`);
  };

  return (
    <div className="flex w-full justify-center bg-[#FAFAFA] px-0 pb-24 pt-0 sm:px-6 sm:pb-16 sm:pt-6">
      <div className="w-full max-w-[640px]">
        <div className="flex w-full min-w-0 flex-col bg-[#FAFAFA] px-5 py-5 sm:rounded-[20px] sm:border sm:border-gray-100 sm:bg-white sm:px-5 sm:py-6 sm:shadow-sm">
          <div className="-mx-5 -mt-5 mb-5 border-b border-gray-100 px-5 pb-3 pt-2 sm:-mx-5 sm:px-5">
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={handleBack}
                aria-label="뒤로가기"
                className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full text-[#4A433D] transition-colors hover:bg-[#F5F3F0]"
              >
                <BackIcon />
              </button>
              <h2 className="text-[16px] font-bold text-[#4A433D]">
                {currentStep === "record" ? selectedBook.name : "성경일독"}
              </h2>
            </div>
          </div>

          <div className="rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm">
            <h1 className="text-[24px] font-black leading-[1.1] text-[#4A433D]">
              성경일독 기록하기
            </h1>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SummaryCard label="선택한 성경" value={selectedBook.name} />
              <SummaryCard
                label="현재 진행도"
                value={`${completedCount}/${selectedBook.totalChapters}`}
              />
            </div>
          </div>

          {currentStep === "select" ? (
            <section className="mt-4 rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[18px] font-bold text-[#4A433D]">
                  어떤 성경을 읽을까요?
                </h2>
                <span className="rounded-full bg-[#F5F3F0] px-3 py-1 text-[11px] font-semibold text-[#8A817A]">
                  책 선택
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-full bg-[#F5F3F0] p-1">
                <button
                  type="button"
                  onClick={() => handleSelectTestament("old")}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all",
                    activeTestament === "old"
                      ? "bg-white text-[#4A433D] shadow-sm"
                      : "text-[#8A817A]",
                  )}
                >
                  구약
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTestament("new")}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all",
                    activeTestament === "new"
                      ? "bg-white text-[#4A433D] shadow-sm"
                      : "text-[#8A817A]",
                  )}
                >
                  신약
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {booksInTab.map((book) => (
                  <BookButton
                    key={book.id}
                    book={book}
                    isFeatured={safeFeaturedBookIds.includes(book.id)}
                    onSelect={() => handleSelectBook(book)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {currentStep === "record" ? (
            <section className="mt-4 rounded-[20px] border border-gray-100 bg-white px-4 py-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep("select")}
                  className="rounded-full bg-[#F5F3F0] px-3 py-2 text-[12px] font-semibold text-[#4A433D]"
                >
                  성경 다시 선택
                </button>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-black text-[#4A433D]">
                    {selectedBook.name} 기록 작성
                  </h2>
                </div>
                <div className="rounded-[18px] bg-[#FFF4EC] px-3 py-2 text-right">
                  <p className="text-[14px] font-bold text-[#4A433D]">
                    {isCompleted ? "완독" : `${nextUnreadChapter}장부터`}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-gray-100 bg-[#FAFAF8] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium text-[#8A817A]">
                      저장된 누적 진도
                    </p>
                    <p className="mt-1 text-[18px] font-bold text-[#4A433D]">
                      {selectedBook.totalChapters}장 중 {completedCount}장 완료
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#D96B2B] ring-1 ring-[#F3D5C0]">
                    {progressPercent}%
                  </div>
                </div>

                <div className="mt-3 h-2 rounded-full bg-[#F1EAE2]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#F6C89A_0%,#D96B2B_100%)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {isProgressLoading ? (
                <div className="mt-4 rounded-[18px] border border-dashed border-gray-200 bg-[#FAFAF8] px-4 py-4 text-[13px] leading-6 text-[#8A817A]">
                  저장된 진도를 불러오는 중입니다.
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-10 gap-2 rounded-[18px] border border-gray-100 bg-white p-4">
                  {Array.from({ length: selectedBook.totalChapters }, (_, index) => {
                    const chapter = index + 1;
                    const isCompletedChapter = chapter <= completedCount;
                    const isSelectedChapter =
                      !!selectedRange &&
                      chapter >= selectedRange.start &&
                      chapter <= selectedRange.end;

                    return (
                      <ChapterDot
                        key={chapter}
                        chapter={chapter}
                        state={
                          isCompletedChapter
                            ? "completed"
                            : isSelectedChapter
                              ? "selected"
                              : "default"
                        }
                        disabled={chapter <= completedCount}
                        onClick={() => handleSelectEndChapter(chapter)}
                      />
                    );
                  })}
                </div>
              )}

              <div className="mt-4 rounded-[18px] border border-gray-100 bg-[#FAFAF8] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-gray-100 bg-white px-3 py-3">
                    <p className="text-[11px] font-medium text-[#8A817A]">
                      마지막 완료 장
                    </p>
                    <p className="mt-2 text-[22px] font-black text-[#4A433D]">
                      {completedCount}장
                    </p>
                  </div>
                  <div className="rounded-[16px] border border-gray-100 bg-white px-3 py-3">
                    <p className="text-[11px] font-medium text-[#8A817A]">
                      다음 시작 장
                    </p>
                    <p className="mt-2 text-[22px] font-black text-[#4A433D]">
                      {isCompleted ? "-" : `${nextUnreadChapter}장`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-gray-100 bg-[#FAFAF8] p-4">
                <div className="rounded-[16px] border border-gray-100 bg-white px-4 py-3">
                  <p className="text-[12px] font-medium text-[#8A817A]">
                    이번 기록 범위
                  </p>
                  <p className="mt-1 text-[18px] font-bold text-[#4A433D]">
                    {rangePreviewText}
                  </p>
                  {!isCompleted ? (
                    <p className="mt-1 text-[13px] text-[#8A817A]">
                      이전 완료 다음 장부터 끝 장만 선택할 수 있습니다.
                    </p>
                  ) : null}
                </div>

                <textarea
                  value={shareContent}
                  onChange={(event) => setShareContent(event.target.value)}
                  placeholder="오늘 읽은 말씀을 통해 느낀 점을 적어보세요."
                  className="mt-3 min-h-[92px] w-full rounded-[16px] border border-gray-100 bg-white px-4 py-3 text-[14px] leading-6 outline-none"
                />

                <button
                  type="button"
                  onClick={handleShareToFeed}
                  disabled={
                    !selectedRange ||
                    !shareContent.trim() ||
                    isCompleted ||
                    isSubmitting ||
                    isProgressSaving
                  }
                  className={`mt-3 w-full rounded-[20px] border px-4 py-3 text-[14px] font-bold ${
                    !selectedRange ||
                    !shareContent.trim() ||
                    isCompleted ||
                    isSubmitting ||
                    isProgressSaving
                      ? "border-gray-100 bg-[#F5F3F0] text-[#A08D7A]"
                      : "border-[#D96B2B] bg-[#FFF4EC] text-[#D96B2B] shadow-sm"
                  }`}
                >
                  {isSubmitting ? "기록 저장 중..." : "피드에 공유하기"}
                </button>

                {submitError ? (
                  <div className="mt-3 rounded-[16px] border border-[#F3D5C0] bg-[#FFF8F3] px-4 py-3">
                    <p className="text-[13px] font-semibold text-[#D96B2B]">
                      저장 실패
                    </p>
                    <p className="mt-1 text-[13px] leading-6 text-[#8A817A]">
                      {submitError}
                    </p>
                  </div>
                ) : null}

                {shareSuccessMessage ? (
                  <div className="mt-3 rounded-[16px] border border-[#F3D5C0] bg-[#FFF8F3] px-4 py-3">
                    <p className="text-[13px] font-semibold text-[#D96B2B]">
                      공유 완료
                    </p>
                    <p className="mt-1 text-[13px] leading-6 text-[#8A817A]">
                      {shareSuccessMessage}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`${isMobilePath ? "/m" : ""}/feed`)}
                        className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D] ring-1 ring-gray-100"
                      >
                        피드 보기
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `${isMobilePath ? "/m" : ""}/${encodeURIComponent(nickName)}`,
                          )
                        }
                        className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D] ring-1 ring-gray-100"
                      >
                        내 프로필 보기
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
