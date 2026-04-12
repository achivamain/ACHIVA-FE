import PaperTitleCover from "@/features/post/PaperTitleCover";
import PhotoTitleCover from "@/features/post/PhotoTitleCover";
import { getDefaultPostTitle } from "@/lib/postDefaults";
import { isAlbumCategory } from "@/lib/postPageTheme";
import { buildUserPath } from "@/lib/nickname";
import { queueToast } from "@/lib/queuedToast";
import { useDraftPostStore } from "@/store/CreatePostStore";
import { DraftPost } from "@/types/Post";
import { User } from "@/types/User";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLayoutEffect, useRef, useState } from "react";
import { NextStepButton } from "./Buttons";

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
  const size = containerWidth ? Math.min(containerWidth, 480) : 480;
  const coverPhotoUrl = draft.photoUrls?.[0] || null;
  const usePhotoCover = isAlbumCategory(draft.category) && !!coverPhotoUrl;

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const createNewPost = async (draft: DraftPost) => {
    if (isAlbumCategory(draft.category) && !(draft.photoUrls?.length)) {
      alert("교회 앨범 게시글은 표지 사진이 필요합니다.");
      return;
    }

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
        queueToast({
          type: "success",
          message: "게시물 작성에 성공했어요.",
        });
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
      <div ref={containerRef} className="w-full max-w-[480px]">
        <div
          style={{ width: size, height: size }}
          className="mx-auto"
        >
          <div
            style={{
              transform: `scale(${size / 390})`,
              transformOrigin: "top left",
            }}
            className="aspect-square w-[390px] h-[390px] relative overflow-hidden"
          >
            {usePhotoCover ? (
              <PhotoTitleCover
                photoUrl={coverPhotoUrl}
                dateLabel={format(new Date(), "yyyy · MM · dd")}
                metaLabel={`${draft.category} · ${(draft.categoryCount ?? 0) + 1}번째 이야기`}
                title={
                  <input
                    maxLength={18}
                    className="w-full bg-transparent text-[38px] font-bold leading-[1.15] tracking-[-0.01em] text-white/[0.97] outline-none placeholder:text-white/70"
                    style={{ textShadow: "0 4px 18px rgba(0,0,0,0.22)" }}
                    type="text"
                    placeholder={getDefaultPostTitle(draft.category)}
                    autoFocus
                    value={draft.title ?? ""}
                    onChange={(e) => {
                      setPost({ title: e.target.value });
                    }}
                  />
                }
              />
            ) : (
              <PaperTitleCover
                dateLabel={format(new Date(), "yyyy · MM · dd")}
                metaLabel={`${draft.category} · ${(draft.categoryCount ?? 0) + 1}번째 이야기`}
                weeklyCount={draft.weeklyWorkoutCount}
                streakWeeks={draft.continuousGoalWeeks}
                title={
                  <input
                    maxLength={18}
                    className="w-full bg-transparent text-[38px] font-bold leading-[1.15] tracking-[-0.01em] text-[#4A312B] outline-none placeholder:text-[#8E837A]"
                    type="text"
                    placeholder={getDefaultPostTitle(draft.category)}
                    autoFocus
                    value={draft.title ?? ""}
                    onChange={(e) => {
                      setPost({ title: e.target.value });
                    }}
                  />
                }
              />
            )}
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
