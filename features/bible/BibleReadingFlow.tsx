"use client";

import { startTransition, useState } from "react";
import { BackIcon } from "@/components/Icons";
import { usePathname, useRouter } from "next/navigation";
import {
  bibleBooks,
  featuredBookIds,
  type BibleBook,
  type Testament,
} from "@/features/bible/mockData";
import { useBibleProgress } from "@/features/bible/progressStore";
import { useBibleReadingFeed } from "@/features/bible/feedStore";

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
  book: BibleBook;
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
  checked,
  onClick,
}: {
  chapter: number;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${chapter}장${checked ? " 읽음" : " 미완료"}`}
      className={cn(
        "h-5 w-5 rounded-full border transition-all duration-200 hover:scale-110 active:scale-95",
        checked
          ? "border-[#D96B2B] bg-[#FFF4EC] shadow-sm"
          : "border-[#E5DDD4] bg-white",
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
  const safeBibleBooks = Array.isArray(bibleBooks) ? bibleBooks : [];
  const safeFeaturedBookIds = Array.isArray(featuredBookIds)
    ? featuredBookIds
    : [];
  const { progress, updateBookProgress } = useBibleProgress();
  const { createPost } = useBibleReadingFeed();

  const [currentStep, setCurrentStep] = useState<"select" | "record">("select");
  const [activeTestament, setActiveTestament] = useState<Testament>("new");
  const [selectedBookId, setSelectedBookId] = useState("john");
  const [shareNote, setShareNote] = useState("");
  const [latestRangeByBookId, setLatestRangeByBookId] = useState<
    Record<string, { start: number; end: number }>
  >({});
  const [shareSuccessMessage, setShareSuccessMessage] = useState("");

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
            mock 데이터가 비어 있어 화면을 구성할 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const completedCount = Math.min(
    selectedBook.totalChapters,
    Math.max(0, progress.completedByBookId[selectedBook.id] ?? 0),
  );
  const nextUnreadChapter = Math.min(
    selectedBook.totalChapters,
    completedCount + 1,
  );
  const latestRange =
    latestRangeByBookId[selectedBook.id] ??
    (completedCount > 0
      ? { start: Math.max(1, completedCount), end: completedCount }
      : null);

  const booksInTab = safeBibleBooks.filter(
    (book) => book.testament === activeTestament,
  );

  const handleSelectTestament = (testament: Testament) => {
    startTransition(() => {
      setActiveTestament(testament);
    });
  };

  const handleSelectBook = (book: BibleBook) => {
    startTransition(() => {
      setSelectedBookId(book.id);
      setCurrentStep("record");
      setShareSuccessMessage("");
    });
  };

  const handleClickChapter = (chapter: number) => {
    const rangeStart =
      chapter >= completedCount ? Math.min(completedCount + 1, chapter) : 1;
    const rangeEnd = chapter;

    startTransition(() => {
      updateBookProgress(selectedBook.id, chapter);
      setShareSuccessMessage("");
      setLatestRangeByBookId((current) => ({
        ...current,
        [selectedBook.id]: {
          start: Math.min(rangeStart, rangeEnd),
          end: Math.max(rangeStart, rangeEnd),
        },
      }));
    });
  };

  const handleShareToFeed = () => {
    if (!latestRange || completedCount === 0) return;

    createPost({
      authorName: nickName,
      bookName: selectedBook.name,
      rangeStart: latestRange.start,
      rangeEnd: latestRange.end,
      completed: completedCount,
      total: selectedBook.totalChapters,
      reflection: shareNote,
    });
    setShareNote("");
    setShareSuccessMessage(
      `${selectedBook.name} ${latestRange.start}장-${latestRange.end}장 기록이 피드에 공유되었어요.`,
    );
  };

  const progressPercent = Math.round(
    (completedCount / selectedBook.totalChapters) * 100,
  );
  const isCompleted = completedCount === selectedBook.totalChapters;
  const isMobilePath = pathname.startsWith("/m/");

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
              <SummaryCard
                label="선택한 성경"
                value={selectedBook.name}
              />
              <SummaryCard
                label="현재 진행률"
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
                    {selectedBook.name} 장 진행 기록
                  </h2>
                </div>
                <div className="rounded-[18px] bg-[#FFF4EC] px-3 py-2 text-right">
                  <p className="text-[14px] font-bold text-[#4A433D]">
                    {isCompleted ? "완독" : `${nextUnreadChapter}장`}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-gray-100 bg-[#FAFAF8] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium text-[#8A817A]">
                      전체 장 수
                    </p>
                    <p className="mt-1 text-[18px] font-bold text-[#4A433D]">
                      {selectedBook.totalChapters}장 중 {completedCount}장 읽음
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

              <div className="mt-4 grid grid-cols-10 gap-2 rounded-[18px] border border-gray-100 bg-white p-4">
                {Array.from({ length: selectedBook.totalChapters }, (_, index) => {
                  const chapter = index + 1;

                  return (
                    <ChapterDot
                      key={chapter}
                      chapter={chapter}
                      checked={chapter <= completedCount}
                      onClick={() => handleClickChapter(chapter)}
                    />
                  );
                })}
              </div>

              <div className="mt-4 rounded-[18px] border border-gray-100 bg-[#FAFAF8] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-gray-100 bg-white px-3 py-3">
                    <p className="text-[11px] font-medium text-[#8A817A]">
                      마지막으로 표시한 장
                    </p>
                    <p className="mt-2 text-[22px] font-black text-[#4A433D]">
                      {completedCount}장
                    </p>
                  </div>
                  <div className="rounded-[16px] border border-gray-100 bg-white px-3 py-3">
                    <p className="text-[11px] font-medium text-[#8A817A]">
                      다음 읽을 장
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
                    오늘 읽은 범위
                  </p>
                  <p className="mt-1 text-[18px] font-bold text-[#4A433D]">
                    {latestRange
                      ? `${selectedBook.name} ${latestRange.start}장 - ${latestRange.end}장`
                      : "아직 기록이 없습니다"}
                  </p>
                  <p className="mt-1 text-[13px] text-[#8A817A]">
                    누적 {completedCount} / {selectedBook.totalChapters}장
                  </p>
                </div>

                <textarea
                  value={shareNote}
                  onChange={(event) => setShareNote(event.target.value)}
                  placeholder="한 줄 소감을 남겨보세요"
                  className="mt-3 min-h-[92px] w-full rounded-[16px] border border-gray-100 bg-white px-4 py-3 text-[14px] leading-6 outline-none"
                />

                <button
                  type="button"
                  onClick={handleShareToFeed}
                  disabled={!latestRange || completedCount === 0}
                  className={`mt-3 w-full rounded-[20px] border px-4 py-3 text-[14px] font-bold ${
                    !latestRange || completedCount === 0
                      ? "border-gray-100 bg-[#F5F3F0] text-[#A08D7A]"
                      : "border-[#D96B2B] bg-[#FFF4EC] text-[#D96B2B] shadow-sm"
                  }`}
                >
                  피드에 공유하기
                </button>

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
                        onClick={() =>
                          router.push(`${isMobilePath ? "/m" : ""}/feed`)
                        }
                        className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4A433D] ring-1 ring-gray-100"
                      >
                        전체 피드 보기
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
                        내 피드 보기
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
