"use client";

import { startTransition, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BackIcon } from "@/components/Icons";
import { usePathname, useRouter } from "next/navigation";
import {
  bibleBooks,
  type ScriptureMeta,
  type Testament,
} from "@/features/bible/mockData";
import { createScriptureReadingArticle } from "@/app/api/bible";
import { useScriptureProgress } from "@/features/bible/hooks/useScriptureProgress";
import {
  formatScriptureRangeLabel,
} from "@/features/bible/selectors";
import { buildMobileUserPath, buildUserPath } from "@/lib/nickname";

type BibleReadingFlowProps = {
  nickName: string;
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-[#E7E1DA] bg-white p-5 shadow-[0_8px_24px_rgba(74,67,61,0.06)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[20px] font-bold text-[#332B25]">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] leading-6 text-[#7A6F65]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function TestamentTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-full rounded-full px-4 text-[13px] leading-none font-semibold transition-colors",
        active
          ? "bg-white text-[#332B25] shadow-[0_2px_8px_rgba(74,67,61,0.08)]"
          : "text-[#8B7D72]",
      )}
    >
      {label}
    </button>
  );
}

function ScriptureCard({
  scripture,
  completedCount,
  isCompleted,
  onSelect,
}: {
  scripture: ScriptureMeta;
  completedCount: number;
  isCompleted: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-[104px] flex-col items-start justify-between rounded-[22px] border px-4 py-4 text-left shadow-[0_4px_14px_rgba(74,67,61,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(74,67,61,0.08)]",
        isCompleted
          ? "border-[#E8C8D8] bg-[#FAEEF4] hover:border-[#E3B7CB]"
          : "border-[#EAE4DD] bg-white hover:border-[#D8CDC2]",
      )}
    >
      <div className="w-full">
        <p className="text-[18px] font-bold text-[#332B25]">{scripture.name}</p>
        <p className="mt-1 text-[13px] text-[#8B7D72]">
          {completedCount} / {scripture.totalChapters}장
        </p>
      </div>
    </button>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 rounded-full bg-[#EEE7DF]">
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#E7BE92_0%,#D96B2B_100%)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ChapterButton({
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
      aria-label={`${chapter}장`}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold transition-all",
        "disabled:cursor-not-allowed disabled:opacity-100",
        state === "completed" &&
          "border-[#D96B2B] bg-[#D96B2B] text-white shadow-[0_4px_10px_rgba(217,107,43,0.2)]",
        state === "selected" &&
          "border-[#D96B2B] bg-[#FFF4E8] text-[#D96B2B]",
        state === "default" && "border-[#DED6CE] bg-white text-[#6F655E]",
      )}
    >
      {chapter}
    </button>
  );
}

function Notice({
  title,
  description,
  tone,
  action,
}: {
  title: string;
  description: string;
  tone: "error" | "success";
  action?: React.ReactNode;
}) {
  const toneClassName =
    tone === "error"
      ? "border-[#F1D2C4] bg-[#FFF7F3]"
      : "border-[#E8C8D8] bg-[#FAEEF4]";

  return (
    <div className={cn("rounded-[18px] border px-4 py-4", toneClassName)}>
      <p
        className={cn(
          "text-[13px] font-semibold",
          tone === "error" ? "text-[#C85D25]" : "text-[#B24C7B]",
        )}
      >
        {title}
      </p>
      <p className="mt-1 text-[13px] leading-6 text-[#7A6F65]">{description}</p>
      {action ? <div className="mt-3 flex flex-wrap gap-2">{action}</div> : null}
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
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBook =
    safeBibleBooks.find((book) => book.id === selectedBookId) ??
    safeBibleBooks[0];

  if (!selectedBook) {
    return (
      <div className="flex w-full justify-center bg-[#F7F5F2] px-4 pb-24 pt-6 sm:px-6 sm:pb-16">
        <div className="w-full max-w-[680px] rounded-[24px] border border-[#E7E1DA] bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(74,67,61,0.06)]">
          <p className="text-[18px] font-bold text-[#332B25]">
            성경 목록을 불러오지 못했어요.
          </p>
          <p className="mt-2 text-[14px] leading-6 text-[#7A6F65]">
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
  const selectedEndChapter =
    draftEndChapterByScriptureId[selectedBook.id] ?? null;
  const selectedRange =
    selectedEndChapter && selectedEndChapter >= nextUnreadChapter
      ? { start: nextUnreadChapter, end: selectedEndChapter }
      : null;
  const progressPercent = Math.round(
    (completedCount / selectedBook.totalChapters) * 100,
  );
  const isCompleted = completedCount === selectedBook.totalChapters;
  const isMobilePath = pathname.startsWith("/m/");

  const scriptureSectionsInTab = useMemo(() => {
    const getCompletedCount = (book: ScriptureMeta) =>
      Math.min(
        book.totalChapters,
        Math.max(0, progress.completedByScriptureId[book.id] ?? 0),
      );

    const getReadingStatusPriority = (book: ScriptureMeta) => {
      const completed = getCompletedCount(book);

      if (completed > 0 && completed < book.totalChapters) {
        return 0;
      }

      if (completed === 0) {
        return 1;
      }

      return 2;
    };

    const books = safeBibleBooks
      .filter((book) => book.testament === activeTestament)
      .sort((a, b) => {
        const priorityDiff =
          getReadingStatusPriority(a) - getReadingStatusPriority(b);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return a.displayOrder - b.displayOrder;
      });

    const sections = [
      {
        key: "reading",
        label: "읽고 있는 성경",
        books: books.filter((book) => {
          const completed = getCompletedCount(book);
          return completed > 0 && completed < book.totalChapters;
        }),
      },
      {
        key: "unread",
        label: "아직 안 읽은 성경",
        books: books.filter((book) => getCompletedCount(book) === 0),
      },
      {
        key: "completed",
        label: "읽기 완료한 성경",
        books: books.filter(
          (book) => getCompletedCount(book) === book.totalChapters,
        ),
      },
    ];

    return sections.filter((section) => section.books.length > 0);
  }, [activeTestament, progress.completedByScriptureId, safeBibleBooks]);

  const rangePreviewText = useMemo(() => {
    if (!selectedRange) {
      return `이번 기록은 ${selectedBook.name} ${nextUnreadChapter}장부터 시작해요. 끝을 선택해 주세요.`;
    }

    return `${formatScriptureRangeLabel(
      selectedBook.name,
      selectedRange.start,
      selectedRange.end,
    )}`;
  }, [nextUnreadChapter, selectedBook.name, selectedRange]);

  const handleSelectTestament = (testament: Testament) => {
    startTransition(() => {
      setActiveTestament(testament);
    });
  };

  const handleSelectBook = (book: ScriptureMeta) => {
    startTransition(() => {
      setSelectedBookId(book.id);
      setCurrentStep("record");
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
      window.alert(
        `${formatScriptureRangeLabel(
          selectedBook.name,
          selectedRange.start,
          selectedRange.end,
        )} 기록했어요.`,
      );
      router.push(
        isMobilePath
          ? buildMobileUserPath(nickName, "/home")
          : buildUserPath(nickName, "/home"),
      );
    } catch (error) {
      console.error(error);
      setSubmitError("기록을 저장하는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === "record") {
      setCurrentStep("select");
      return;
    }

    router.push(
      isMobilePath
        ? buildMobileUserPath(nickName, "/home")
        : buildUserPath(nickName, "/home"),
    );
  };

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#F7F5F2] px-4 pb-24 pt-5 sm:px-6 sm:pb-16">
      <div className="w-full max-w-[680px]">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E0D9] bg-white text-[#332B25] transition-colors hover:bg-[#F7F4F0]"
          >
            <BackIcon />
          </button>
          <h1 className="text-[18px] font-bold text-[#332B25]">성경 일독</h1>
          <div className="w-10" aria-hidden />
        </div>

        {currentStep === "select" ? (
          <SectionCard>
            <SectionHeader
              title="어떤 성경을 읽을까요?"
              action={
                <div className="grid h-[30px] grid-cols-2 items-center gap-1 rounded-full bg-[#F1ECE6] px-1 py-0.5">
                  <TestamentTab
                    label="구약"
                    active={activeTestament === "old"}
                    onClick={() => handleSelectTestament("old")}
                  />
                  <TestamentTab
                    label="신약"
                    active={activeTestament === "new"}
                    onClick={() => handleSelectTestament("new")}
                  />
                </div>
              }
            />

            <div className="mt-4">
              {scriptureSectionsInTab.map((section, index) => (
                <div
                  key={section.key}
                  className={cn(index > 0 && "mt-5 border-t border-[#EEE7DF] pt-5")}
                >
                  <p className="mb-3 text-[13px] font-semibold tracking-[0.08em] text-[#8B7D72]">
                    {section.label}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {section.books.map((book) => (
                      <ScriptureCard
                        key={book.id}
                        scripture={book}
                        completedCount={Math.min(
                          book.totalChapters,
                          Math.max(0, progress.completedByScriptureId[book.id] ?? 0),
                        )}
                        isCompleted={
                          Math.min(
                            book.totalChapters,
                            Math.max(0, progress.completedByScriptureId[book.id] ?? 0),
                          ) === book.totalChapters
                        }
                        onSelect={() => handleSelectBook(book)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {currentStep === "record" ? (
          <div className="flex flex-col gap-4">
            <SectionCard>
              <SectionHeader
                title={`${selectedBook.name} 기록 작성`}
              />

              <div
                className={cn(
                  "mt-5 rounded-[20px] border p-4",
                  isCompleted
                    ? "border-[#E8C8D8] bg-[#FAEEF4]"
                    : "border-[#ECE6E0] bg-[#FBF9F6]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-medium text-[#8B7D72]">
                      누적 진행도
                    </p>
                    <p className="mt-1 text-[20px] font-bold text-[#332B25]">
                      {completedCount} / {selectedBook.totalChapters}장
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full bg-white px-2.5 py-1 text-[11px] leading-none font-semibold",
                      isCompleted
                        ? "border border-[#E3B7CB] text-[#B24C7B]"
                        : "border border-[#EBC6A8] text-[#C85D25]",
                    )}
                  >
                    {progressPercent}%
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar percent={progressPercent} />
                </div>
              </div>

              {!isCompleted ? (
                <div className="mt-4 rounded-[18px] border border-[#ECE6E0] bg-[#FBF9F6] px-4 py-3 text-[13px] leading-6 text-[#7A6F65]">
                  이번 기록은 {selectedBook.name} {nextUnreadChapter}장부터 시작해요.<br/>
                  작성할 범위의 끝을 선택해주세요.
                </div>
              ) : (
                <div className="mt-4 rounded-[18px] border border-[#E8C8D8] bg-[#FAEEF4] px-4 py-3 text-[13px] leading-6 text-[#7A6F65]">
                  <p className="font-semibold text-[#B24C7B]">
                    이 성경은 기록이 모두 완료되었어요.
                  </p>
                </div>
              )}

              {isProgressLoading ? (
                <div className="mt-4 rounded-[18px] border border-dashed border-[#DDD5CD] bg-[#FBF9F6] px-4 py-4 text-[13px] leading-6 text-[#7A6F65]">
                  진행도를 불러오는 중이에요.
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-7 gap-2 rounded-[20px] border border-[#ECE6E0] bg-white p-4 sm:grid-cols-10">
                  {Array.from(
                    { length: selectedBook.totalChapters },
                    (_, index) => {
                      const chapter = index + 1;
                      const isCompletedChapter = chapter <= completedCount;
                      const isSelectedChapter =
                        !!selectedRange &&
                        chapter >= selectedRange.start &&
                        chapter <= selectedRange.end;

                      return (
                        <ChapterButton
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
                    },
                  )}
                </div>
              )}

              {!isCompleted ? (
                <>
                  <div className="mt-4 rounded-[20px] border border-[#ECE6E0] bg-[#FBF9F6] p-4">
                    <p className="text-[12px] font-medium text-[#8B7D72]">
                      현재 선택된 범위
                    </p>
                    <p className="mt-1 text-[18px] font-bold text-[#332B25]">
                      {rangePreviewText}
                    </p>
                  </div>

                  <textarea
                    value={shareContent}
                    onChange={(event) => setShareContent(event.target.value)}
                    placeholder="남기고 싶은 생각을 적어 주세요."
                    className="mt-4 min-h-[132px] w-full rounded-[20px] border border-[#E6E0D9] bg-white px-4 py-4 text-[14px] leading-7 text-[#332B25] outline-none transition-colors placeholder:text-[#9A8E84] focus:border-[#D8C3B0]"
                  />

                  <div className="mt-2 flex items-center justify-end gap-3">
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
                      className={cn(
                        "shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
                        !selectedRange ||
                          !shareContent.trim() ||
                          isCompleted ||
                          isSubmitting ||
                          isProgressSaving
                          ? "bg-[#EAE4DD] text-[#9B8F84]"
                          : "bg-[#D96B2B] text-white shadow-[0_8px_16px_rgba(217,107,43,0.18)] hover:bg-[#C85D25]",
                      )}
                    >
                      {isSubmitting ? "저장 중..." : "기록 남기기"}
                    </button>
                  </div>
                </>
              ) : null}

              {submitError ? (
                <div className="mt-4">
                  <Notice
                    tone="error"
                    title="저장에 실패했어요"
                    description={submitError}
                  />
                </div>
              ) : null}
            </SectionCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}
