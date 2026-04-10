"use client";

import { useState } from "react";
import { useBibleReadingFeed, type BibleReadingFeedPost } from "@/features/bible/feedStore";
import Link from "next/link";
import ProfileImg from "@/components/ProfileImg";
import BibleReadingCalendarModal from "@/features/bible/BibleReadingCalendarModal";

function MiniProgressDots({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const dotCount = Math.min(8, total);

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: dotCount }, (_, index) => {
        const threshold = Math.ceil(((index + 1) / dotCount) * total);
        const filled = completed >= threshold;

        return (
          <span
            key={`${total}-${index}`}
            className={
              filled
                ? "h-2.5 w-2.5 rounded-full bg-[#D96B2B]"
                : "h-2.5 w-2.5 rounded-full border border-[#E5DDD4] bg-white"
            }
          />
        );
      })}
    </div>
  );
}

export default function BibleReadingFeedCard({
  post,
  authorPosts,
}: {
  post: BibleReadingFeedPost;
  authorPosts: BibleReadingFeedPost[];
}) {
  const { toggleLike, toggleCheer, addComment } = useBibleReadingFeed();
  const [commentInput, setCommentInput] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <article className="w-full">
      <div className="flex items-center gap-2.5 px-5 py-2.5 sm:px-0">
        <Link href={`/${encodeURIComponent(post.authorName)}`} className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <ProfileImg size={38} url={post.authorProfileUrl} />
          </div>
          <p className="font-medium text-[#111111]">{post.authorName}</p>
        </Link>
        <span className="rounded-full bg-[#FFF4EC] px-2.5 py-1 text-[10px] font-semibold text-[#D96B2B]">
          말씀일독
        </span>
        <p className="font-light text-black/50">
          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      <div className="rounded-[28px] border border-gray-100 bg-white px-4 py-4 shadow-sm">
        <div className="rounded-[24px] bg-[#FAFAF8] px-4 py-4">
          <p className="text-[12px] font-medium text-[#8A817A]">오늘 읽은 범위</p>
          <h3 className="mt-1 text-[24px] font-black text-[#4A433D]">
            {post.bookName} {post.rangeLabel}
          </h3>
          {post.reflection ? (
            <p className="mt-3 text-[14px] leading-6 text-[#6E655D]">
              {post.reflection}
            </p>
          ) : null}
        </div>

        <div className="mt-3 rounded-[20px] border border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-bold text-[#4A433D]">
              {post.bookName} {post.completed} / {post.total}장
            </p>
            <p className="text-[15px] font-black text-[#D96B2B]">
              {post.progressPercent}%
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[#ECE7E1]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#F6C89A_0%,#D96B2B_100%)]"
              style={{ width: `${post.progressPercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <MiniProgressDots completed={post.completed} total={post.total} />
            <p className="text-[12px] font-medium text-[#8A817A]">
              최근 {post.completed}장까지
            </p>
          </div>
        </div>

        <div className="mt-3 flex w-full items-center justify-center gap-[2px] overflow-hidden px-1 py-1 sm:gap-2 sm:py-3.5">
          <button
            type="button"
            onClick={() => toggleLike(post.id)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-full border px-2 py-2 text-[12px] font-medium transition-all ${
              post.likedByMe
                ? "border-[#F3D5C0] bg-[#FFF4EC] text-[#D96B2B]"
                : "border-gray-200 bg-gray-50 text-[#6B7280] hover:border-gray-300 hover:bg-gray-100"
            }`}
          >
            좋아요 {post.likes}
          </button>
          <button
            type="button"
            onClick={() => toggleCheer(post.id)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-full border px-2 py-2 text-[12px] font-medium transition-all ${
              post.cheeredByMe
                ? "border-[#F3D5C0] bg-[#FFF4EC] text-[#D96B2B]"
                : "border-gray-200 bg-gray-50 text-[#6B7280] hover:border-gray-300 hover:bg-gray-100"
            }`}
          >
            응원 {post.cheers}
          </button>
          <div className="flex flex-1 items-center justify-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-2 text-[12px] font-medium text-[#6B7280]">
            댓글 {post.comments.length}
          </div>
        </div>

        <div className="mt-1 rounded-[20px] bg-[#FAFAF8] p-3">
          {post.comments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {post.comments.slice(-2).map((comment) => (
                <p key={comment.id} className="text-[13px] leading-6 text-[#6E655D]">
                  <span className="font-semibold text-[#4A433D]">
                    {comment.author}
                  </span>{" "}
                  {comment.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#8A817A]">
              아직 남겨진 댓글이 없습니다.
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <input
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              placeholder="따뜻한 한마디 남기기"
              className="flex-1 rounded-full border border-gray-100 bg-white px-4 py-2 text-[13px] outline-none"
            />
            <button
              type="button"
              onClick={() => {
                addComment(post.id, "나", commentInput);
                setCommentInput("");
              }}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-[12px] font-semibold text-[#4A433D]"
            >
              댓글
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCalendarOpen(true)}
          className="mt-3 w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-[13px] font-semibold text-[#4A433D]"
        >
          전체 보기
        </button>
      </div>

      {isCalendarOpen ? (
        <BibleReadingCalendarModal
          authorName={post.authorName}
          posts={authorPosts}
          onClose={() => setIsCalendarOpen(false)}
        />
      ) : null}
    </article>
  );
}
