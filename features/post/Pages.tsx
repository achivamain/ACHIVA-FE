import { PostRes } from "@/types/Post";
import type { Question } from "@/types/Post";
import PostImg from "@/components/PostImg";
import { format } from "date-fns";

type Props = {
  size: number;
  post: PostRes;
};

export function TitlePage({ size, post }: Props) {
  const date = new Date(post.createdAt);
  const weeklyCount = post.weeklyWorkoutCount ?? null;
  const streakWeeks = post.continuousGoalWeeks ?? null;

  return (
    <div style={{ height: size, width: size }}>
      <div
        style={{
          transform: `scale(${size / 390})`,
          transformOrigin: "top left",
        }}
        className="aspect-square w-[390px] h-[390px] relative overflow-hidden"
      >
        <PostImg url={post.photoUrls?.[0] || null} filtered />

        {/* 그라디언트 오버레이 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* 상단: 날짜 + 카테고리 태그 */}
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

        {/* 상단 구분선 */}
        <div
          className="absolute left-[22px] right-[22px]"
          style={{ top: "56px", height: "1px", background: "rgba(255,255,255,0.18)" }}
        />

        {/* 하단 콘텐츠 */}
        <div className="absolute bottom-[22px] left-[22px] right-[22px]">
          {/* 통계 배지 */}
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

          {/* 구분선 */}
          <div
            className="mb-[12px]"
            style={{ height: "1px", background: "rgba(255,255,255,0.2)" }}
          />

          {/* 제목 */}
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

          {/* 서브텍스트 */}
          <p
            className="text-[14px] font-medium tracking-[0.06em]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {post.category} · {post.authorCategorySeq}번째 이야기
          </p>
        </div>
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
  backgroundColor: string;
}) {
  return (
    <div style={{ height: size, width: size }}>
      <div
        style={{
          transform: `scale(${size / 430})`,
          transformOrigin: "top left",
          backgroundColor: backgroundColor,
        }}
        className={`aspect-square w-[430px] h-[430px] py-[95px] px-[20px] ${
          backgroundColor === "#f9f9f9" ? "text-black" : "text-white"
        }`}
      >
        <div>
          {page.question && (
            <h2 className="font-semibold text-[32px] mb-[24px] leading-[50px]">
              {page.question}
            </h2>
          )}
          <div className="whitespace-pre-wrap">{page.content}</div>
        </div>
      </div>
    </div>
  );
}
