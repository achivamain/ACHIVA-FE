import PostImg from "@/components/PostImg";
import { useDraftPostStore } from "@/store/CreatePostStore";
import { NextStepButton } from "./Buttons";
import { format } from "date-fns";
import { useState, useRef, useLayoutEffect } from "react";
import { User } from "@/types/User";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { DraftPost } from "@/types/Post";

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
  const [isEditing, setIsEditing] = useState(false);
  const size = window.innerWidth < 640 ? containerWidth ?? 0 : 480;

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const createNewPost = async (draft: DraftPost) => {
    //게시글 생성
    setIsLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          post: draft,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        console.log(res);
        throw new Error("게시글 작성 중 에러");
      }
    } catch (err) {
      console.log(err);
      alert(
        "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
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
          className="aspect-square w-[390px] h-[390px] relative z-[60]"
        >
          <PostImg url={draft.titleImageUrl!} filtered />
          <div className="absolute top-[90px] left-[23px]">
            <div className="font-light text-[16px] text-white/70">
              {format(new Date(), "yyyy.MM.dd")}
            </div>
            <input
              maxLength={18}
              className={`w-full relative z-[62] ${
                isEditing ? "text-white" : "text-white/80"
              } placeholder:text-white/80 font-semibold text-[45px] mb-[24px] leading-[50px] outline-none`}
              type="text"
              placeholder="오늘의 성취"
              autoFocus
              value={draft.title ?? ""}
              onChange={(e) => {
                setIsEditing(true);
                setPost({ title: e.target.value });
              }}
              onBlur={() => {
                setIsEditing(false);
              }}
            />
            <div className={`text-[32px] font-light text-white leading-[40px]`}>
              <div>
                <span className="font-bold">{draft.category}</span> 기록
              </div>
              <div>
                <span className="font-bold">
                  {(draft.categoryCount?? 0) + 1}번째
                </span>{" "}
                이야기
              </div>
            </div>
          </div>
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40"
              />
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40"
            />
          )}
        </AnimatePresence>
      </div>
      <div className="w-full mt-5">
        <NextStepButton
          isLoading={isLoading}
          // disabled={!draft.title}
          onClick={async () => {
              createNewPost(draft);
          }}
        >
          공유하기
        </NextStepButton>
      </div>
    </div>
  );
}
