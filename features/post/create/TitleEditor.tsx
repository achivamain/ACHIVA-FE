import PostImg from "@/components/PostImg";
import { useDraftPostStore } from "@/store/CreatePostStore";
import { NextStepButton } from "./Buttons";
import { format } from "date-fns";
import { useState, useRef, useLayoutEffect } from "react";
import { User } from "@/types/User";
import { useQuery } from "@tanstack/react-query";
import { DraftPost } from "@/types/Post";
import { getDefaultPostTitle } from "@/lib/postDefaults";
import { buildUserPath } from "@/lib/nickname";

export default function TitleEditor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const draft = useDraftPostStore.use.post();
  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch(`/api/members/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("network error");
      }
      return (await res.json()).data as User;
    },
  });

  const setPost = useDraftPostStore.use.setPost();
  const [isLoading, setIsLoading] = useState(false);
  const size = window.innerWidth < 640 ? (containerWidth ?? 0) : 480;

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const createNewPost = async (draft: DraftPost) => {
    setIsLoading(true);
    try {
      const {
        weeklyWorkoutCount: _weeklyWorkoutCount,
        continuousGoalWeeks: _continuousGoalWeeks,
        ...postPayload
      } = draft;

      const res = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          post: postPayload,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        console.log(res);
        throw new Error("게시글 작성 중 에러");
      }
      if (currentUser?.nickName) {
        window.location.href = buildUserPath(currentUser.nickName);
      }
    } catch (err) {
      console.log(err);
      alert(
        "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} className="w-full sm:w-120 aspect-square">
        <div
          style={{
            transform: `scale(${size / 390})`,
            transformOrigin: "top left",
          }}
          className="aspect-square w-[390px] h-[390px] relative overflow-hidden"
        >
          <PostImg url={draft.photoUrls?.[0] || null} filtered />

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
              {format(new Date(), "yyyy · MM · dd")}
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
              {draft.category}
            </span>
          </div>

          {/* 상단 구분선 */}
          <div
            className="absolute left-[22px] right-[22px]"
            style={{
              top: "56px",
              height: "1px",
              background: "rgba(255,255,255,0.18)",
            }}
          />

          {/* 하단 콘텐츠 */}
          <div className="absolute bottom-[22px] left-[22px] right-[22px]">
            {/* 통계 배지 */}
            {draft.weeklyWorkoutCount !== undefined &&
              draft.weeklyWorkoutCount > 0 && (
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
                      {Array.from(
                        { length: Math.min(draft.weeklyWorkoutCount, 7) },
                        (_, i) => (
                          <span key={i}>🔥</span>
                        ),
                      )}
                    </span>
                    <span
                      className="text-[12px] font-semibold tracking-[0.03em]"
                      style={{ color: "rgba(255,255,255,0.95)" }}
                    >
                      이번 주 {draft.weeklyWorkoutCount}회
                    </span>
                  </div>

                  {draft.continuousGoalWeeks !== undefined &&
                    draft.continuousGoalWeeks >= 2 && (
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
                          {draft.continuousGoalWeeks}주 연속 달성
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
            <input
              maxLength={18}
              className="w-full font-bold leading-[1.15] outline-none bg-transparent mb-[10px]"
              style={{
                fontSize: "38px",
                color: "rgba(255,255,255,0.95)",
                textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                letterSpacing: "-0.01em",
              }}
              type="text"
              placeholder={getDefaultPostTitle(draft.category)}
              autoFocus
              value={draft.title ?? ""}
              onChange={(e) => {
                setPost({ title: e.target.value });
              }}
            />

            {/* 서브텍스트 */}
            <p
              className="text-[14px] font-medium tracking-[0.06em]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {draft.category} · {(draft.categoryCount ?? 0) + 1}번째 이야기
            </p>
          </div>
        </div>
      </div>
      <div className="w-full mt-5">
        <NextStepButton
          isLoading={isLoading}
          onClick={async () => {
            createNewPost(draft);
          }}
        >
          공유하기
        </NextStepButton>
      </div>
      <p className="my-2 text-[#808080] text-[13px]">
        커뮤니티 가이드라인을 위반한 게시글은 즉각적인 제재가 이루어질 수
        있습니다.
      </p>
    </div>
  );
}
