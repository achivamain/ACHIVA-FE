"use client";

import { PostRes } from "@/types/Post";
import type { Question } from "@/types/Post";
import PostImg from "@/components/PostImg";
import { format, startOfWeek, endOfWeek, subWeeks, isWithinInterval } from "date-fns";
import { useEffect, useState } from "react";

type Props = {
  size: number;
  post: PostRes;
};

// 게시글 작성자의 게시글들 중 이번 주 포스트 수 및 연속 주 3회 달성 스트릭을 계산
function useWorkoutStats(memberId: string, postDateString: string) {
  const [weeklyCount, setWeeklyCount] = useState<number | null>(null);
  const [streakWeeks, setStreakWeeks] = useState<number | null>(null);

  useEffect(() => {
    if (!memberId || !postDateString) return;

    async function fetchStats() {
      try {
        const res = await fetch(
          `/api/members/getPosts?id=${memberId}&pageParam=0&size=200&sort=DESC`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        if (!res.ok) return;
        const json = await res.json();
        const posts: { createdAt: string }[] = json.data?.content ?? [];

        const referenceDate = new Date(postDateString);

        const thisWeekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
        const thisWeekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
        const thisWeekPosts = posts.filter((p) => {
          const pDate = new Date(p.createdAt);
          return isWithinInterval(pDate, {
            start: thisWeekStart,
            end: thisWeekEnd,
          }) && pDate.getTime() <= referenceDate.getTime();
        });
        setWeeklyCount(thisWeekPosts.length);

        let streak = 0;
        if (thisWeekPosts.length >= 3) {
          streak = 1;
          let weekIdx = 1;
          while (true) {
            const weekStart = startOfWeek(subWeeks(referenceDate, weekIdx), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(subWeeks(referenceDate, weekIdx), { weekStartsOn: 1 });
            const count = posts.filter((p) =>
              isWithinInterval(new Date(p.createdAt), { start: weekStart, end: weekEnd })
            ).length;
            if (count >= 3) { streak++; weekIdx++; } else break;
          }
        } else {
          let weekIdx = 1;
          while (true) {
            const weekStart = startOfWeek(subWeeks(referenceDate, weekIdx), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(subWeeks(referenceDate, weekIdx), { weekStartsOn: 1 });
            const count = posts.filter((p) =>
              isWithinInterval(new Date(p.createdAt), { start: weekStart, end: weekEnd })
            ).length;
            if (count >= 3) { streak++; weekIdx++; } else break;
          }
        }
        setStreakWeeks(streak);
      } catch {
        // silently ignore
      }
    }

    fetchStats();
  }, [memberId, postDateString]);

  return { weeklyCount, streakWeeks };
}

export function TitlePage({ size, post }: Props) {
  const date = new Date(post.createdAt);
  const { weeklyCount, streakWeeks } = useWorkoutStats(post.memberId, post.createdAt);

  return (
    <div style={{ height: size, width: size }}>
      <div
        style={{
          transform: `scale(${size / 390})`,
          transformOrigin: "top left",
        }}
        className="aspect-square w-[390px] h-[390px] relative overflow-hidden"
      >
        {/* 배경 이미지 */}
        <PostImg url={post.photoUrls?.[0] || "/default-cover-bg.png"} filtered />

        {/* 그라디언트 오버레이: 상단 약하게, 하단 강하게 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.78) 100%)",
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

        {/* 얇은 구분선 */}
        <div
          className="absolute left-[22px] right-[22px]"
          style={{ top: "56px", height: "1px", background: "rgba(255,255,255,0.18)" }}
        />

        {/* 하단 콘텐츠 영역 */}
        <div className="absolute bottom-[22px] left-[22px] right-[22px]">
          {/* 배지 영역 */}
          {weeklyCount !== null && (
            <div className="flex items-center gap-[8px] mb-[14px] flex-wrap">
              {/* 이번 주 운동 횟수 */}
              <div
                className="flex items-center gap-[6px] px-[11px] py-[5px] rounded-full"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <span className="text-[13px] leading-none">
                  {weeklyCount === 0
                    ? "🌱"
                    : Array.from({ length: Math.min(weeklyCount, 7) }, (_, i) => (
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

              {/* 스트릭 배지 */}
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

          {/* 타이틀 */}
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

          {/* 서브텍스트: N번째 이야기 */}
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
  photoUrl,
}: {
  size: number;
  page: Question;
  backgroundColor: string;
  photoUrl?: string | null;
}) {
  const resolvedPhoto = photoUrl || "/default-cover-bg.png";
  const hasPhoto = true; // 기본 이미지로 항상 사진 배경 사용
  const isLight = backgroundColor === "#f9f9f9";

  return (
    <div style={{ height: size, width: size }}>
      <div
        style={{
          transform: `scale(${size / 430})`,
          transformOrigin: "top left",
          backgroundColor: hasPhoto ? "transparent" : backgroundColor,
        }}
        className="aspect-square w-[430px] h-[430px] relative overflow-hidden"
      >
        {/* 사진 배경 */}
        <PostImg url={resolvedPhoto} filtered />

        {/* 그라디언트 오버레이 (사진 있을 때만) */}
        {hasPhoto && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.82) 100%)",
            }}
          />
        )}

        {/* 콘텐츠 */}
        <div
          className={`absolute inset-0 flex flex-col px-[28px] pt-[26px] pb-[28px] ${
            hasPhoto ? "" : "py-[95px] px-[20px]"
          }`}
          style={
            !hasPhoto
              ? { color: isLight ? "#000" : "#fff", padding: "95px 20px" }
              : undefined
          }
        >
          {/* 질문 라벨 — 상단, 크고 명확하게 */}
          {page.question && (
            <div className="mb-[18px]">
              <span
                className="text-[15px] font-bold tracking-[0.04em] px-[14px] py-[6px] rounded-full inline-block"
                style={
                  hasPhoto
                    ? {
                        color: "rgba(255,255,255,1)",
                        background: "rgba(255,255,255,0.22)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.4)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                      }
                    : {
                        color: isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)",
                        borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)",
                        background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)",
                      }
                }
              >
                {page.question}
              </span>
            </div>
          )}

          {/* 얇은 구분선 (사진 있을 때) */}
          {hasPhoto && (
            <div
              className="mb-[20px]"
              style={{ height: "1px", background: "rgba(255,255,255,0.25)" }}
            />
          )}

          {/* 본문 내용 */}
          <p
            className="whitespace-pre-wrap leading-[1.7] font-medium"
            style={
              hasPhoto
                ? {
                    fontSize: "20px",
                    color: "rgba(255,255,255,0.95)",
                    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                  }
                : {
                    fontSize: "18px",
                    color: isLight ? "#000" : "#fff",
                  }
            }
          >
            {page.content}
          </p>
        </div>
      </div>
    </div>
  );
}
