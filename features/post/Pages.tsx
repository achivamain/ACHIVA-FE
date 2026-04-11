import { PostRes } from "@/types/Post";
import type { Question } from "@/types/Post";
import PostImg from "@/components/PostImg";
import { format } from "date-fns";
import { getPostPageSurface, getPostPageTone } from "@/lib/postPageTheme";
import PaperTitleCover from "./PaperTitleCover";
import {
  CONTENT_CARD_BODY_CLASS,
  CONTENT_CARD_BODY_WRAP_CLASS,
  CONTENT_CARD_DIVIDER_CLASS,
  CONTENT_CARD_SHELL_CLASS,
  CONTENT_CARD_TITLE_CLASS,
  CONTENT_CARD_TITLE_WRAP_CLASS,
} from "./contentCardLayout";

type Props = {
  size: number;
  post: PostRes;
};

export function TitlePage({ size, post }: Props) {
  const date = new Date(post.createdAt);
  const weeklyCount = post.weeklyWorkoutCount ?? null;
  const streakWeeks = post.continuousGoalWeeks ?? null;
  const hasPhoto = Boolean(post.photoUrls?.[0]);

  return (
    <div style={{ height: size, width: size }}>
      <div
        style={{
          transform: `scale(${size / 390})`,
          transformOrigin: "top left",
        }}
        className="aspect-square w-[390px] h-[390px] relative overflow-hidden"
      >
        {hasPhoto ? (
          <>
            <PostImg url={post.photoUrls?.[0] || null} filtered />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.45) 100%)",
              }}
            />

            <div className="absolute top-[22px] left-[22px] right-[22px] flex items-center justify-between">
              <span
                className="text-[13px] font-medium tracking-[0.12em] uppercase"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {format(date, "yyyy · MM · dd")}
              </span>
              <span
                className="text-[11px] font-semibold tracking-[0.08em] px-[10px] py-[4px] rounded-full border"
                style={{
                  color: "rgba(255,255,255,0.85)",
                  borderColor: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(6px)",
                }}
              >
                {post.category}
              </span>
            </div>

            <div
              className="absolute left-[22px] right-[22px]"
              style={{
                top: "56px",
                height: "1px",
                background: "rgba(255,255,255,0.18)",
              }}
            />

            <div className="absolute bottom-[22px] left-[22px] right-[22px]">
              {weeklyCount !== null && weeklyCount > 0 && (
                <div className="flex items-center gap-[8px] mb-[14px] flex-wrap">
                  <div
                    className="flex items-center gap-[6px] px-[11px] py-[5px] rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <span className="text-[13px] leading-none">
                      {Array.from({ length: Math.min(weeklyCount, 7) }, (_, i) => (
                        <span key={i}>🔥</span>
                      ))}
                    </span>
                    <span
                      className="text-[12px] font-semibold tracking-[0.03em]"
                      style={{ color: "rgba(255,255,255,0.95)" }}
                    >
                      이번 주 {weeklyCount}회
                    </span>
                  </div>

                  {streakWeeks !== null && streakWeeks >= 2 && (
                    <div
                      className="flex items-center gap-[5px] px-[11px] py-[5px] rounded-full"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(251,146,60,0.85) 0%, rgba(239,68,68,0.75) 100%)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,200,100,0.35)",
                      }}
                    >
                      <span className="text-[13px] leading-none">⚡</span>
                      <span
                        className="text-[12px] font-bold tracking-[0.02em]"
                        style={{ color: "rgba(255,255,255,1)" }}
                      >
                        {streakWeeks}주 연속 달성
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div
                className="mb-[12px]"
                style={{ height: "1px", background: "rgba(255,255,255,0.2)" }}
              />

              <h1
                className="font-bold leading-[1.15] mb-[10px]"
                style={{
                  fontSize: "38px",
                  color: "rgba(255,255,255,0.95)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                  letterSpacing: "-0.01em",
                }}
              >
                {post.title}
              </h1>

              <p
                className="text-[14px] font-medium tracking-[0.06em]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {post.category} · {post.authorCategorySeq}번째 이야기
              </p>
            </div>
          </>
        ) : (
          <PaperTitleCover
            backgroundColor={post.backgroundColor}
            dateLabel={format(date, "yyyy · MM · dd")}
            metaLabel={`${post.category} · ${post.authorCategorySeq}번째 이야기`}
            weeklyCount={weeklyCount}
            streakWeeks={streakWeeks}
            title={
              <h1
                className="font-bold leading-[1.15] text-[#4A312B]"
                style={{
                  fontSize: "38px",
                  letterSpacing: "-0.01em",
                }}
              >
                {post.title}
              </h1>
            }
          />
        )}
      </div>
    </div>
  );
}

export function ContentPage({
  size,
  page,
  backgroundColor,
}: {
  size: number;
  page: Question;
  backgroundColor: string | null;
}) {
  const tone = getPostPageTone(backgroundColor);

  return (
    <div style={{ height: size, width: size }}>
      <div
        style={{
          transform: `scale(${size / 430})`,
          transformOrigin: "top left",
          ...getPostPageSurface(backgroundColor),
        }}
        className={`${CONTENT_CARD_SHELL_CLASS} ${tone.shellTextClassName}`}
      >
        <div
          className={CONTENT_CARD_DIVIDER_CLASS}
          style={{ background: tone.accentLineColor }}
        />
        <div
          className="absolute w-[160px] h-[160px] rounded-full blur-[42px] -top-[48px] -left-[20px]"
          style={{ background: tone.ornamentColor }}
        />
        {page.question && (
          <div className={CONTENT_CARD_TITLE_WRAP_CLASS}>
            <h2 className={`${CONTENT_CARD_TITLE_CLASS} ${tone.subtitleClassName}`}>
              {page.question}
            </h2>
          </div>
        )}
        <div className={CONTENT_CARD_BODY_WRAP_CLASS}>
          <div
            className={`${CONTENT_CARD_BODY_CLASS} whitespace-pre-wrap ${tone.contentClassName}`}
          >
            {page.content}
          </div>
        </div>
      </div>
    </div>
  );
}
