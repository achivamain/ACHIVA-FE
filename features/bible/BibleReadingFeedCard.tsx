"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProfileImg from "@/components/ProfileImg";
import CheerBtns from "@/features/post/CheerBtns";
import BibleReadingCalendarModal from "@/features/bible/BibleReadingCalendarModal";
import {
  getScriptureRangeLabel,
  getScriptureReflection,
} from "@/features/bible/selectors";
import { getScriptureMeta } from "@/features/bible/mockData";
import type { ScriptureReadingFeedPost } from "@/features/bible/types";
import { buildUserPath, getDisplayNickName } from "@/lib/nickname";

export default function BibleReadingFeedCard({
  post,
}: {
  post: ScriptureReadingFeedPost;
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const scripture = getScriptureMeta(post.scriptureReading.scriptureId);
  const reflection = getScriptureReflection(post);
  const totalChapters =
    scripture?.totalChapters ?? post.scriptureReading.completedChapters;
  const progressPercent = useMemo(() => {
    if (totalChapters <= 0) return 0;
    return Math.round(
      (post.scriptureReading.completedChapters / totalChapters) * 100,
    );
  }, [post.scriptureReading.completedChapters, totalChapters]);

  return (
    <article className="w-full bg-white px-5 py-3 sm:px-0">
      <div className="flex items-center gap-2.5 py-2.5 sm:px-0">
        <Link
          href={buildUserPath(post.memberNickName)}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-shrink-0">
            <ProfileImg size={38} url={post.memberProfileUrl} />
          </div>
          <p className="font-medium text-[#111111]">
            {getDisplayNickName(post.memberNickName)}
          </p>
        </Link>
        <p className="font-light text-black/50">
          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      <div className="bg-[#FAFAF8] px-4 py-4">
        <p className="text-[12px] font-medium text-[#8A817A]">오늘 읽은 범위</p>
        <h3 className="mt-1 text-[24px] font-black text-[#4A433D]">
          {getScriptureRangeLabel(post)}
        </h3>
        {reflection ? (
          <p className="mt-3 text-[14px] leading-6 text-[#6E655D]">
            {reflection}
          </p>
        ) : null}
      </div>

      <div className="py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[14px] font-bold text-[#4A433D]">
            {post.scriptureReading.scriptureId}{" "}
            {post.scriptureReading.completedChapters} / {totalChapters}장
          </p>
          <p className="text-[15px] font-black text-[#D96B2B]">
            {progressPercent}%
          </p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#ECE7E1]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#F6C89A_0%,#D96B2B_100%)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-3 w-full px-1 py-1 sm:px-0 sm:py-2">
          <CheerBtns postId={post.id} cheerings={post.cheerings ?? []} />
        </div>

        <button
          type="button"
          onClick={() => setIsCalendarOpen(true)}
          className="mt-2 w-full rounded-[8px] border border-gray-200 bg-white px-4 py-3 text-[13px] font-semibold text-[#4A433D]"
        >
          전체 기록 보기
        </button>
      </div>

      {isCalendarOpen ? (
        <BibleReadingCalendarModal
          authorName={getDisplayNickName(post.memberNickName)}
          memberId={post.memberId}
          onClose={() => setIsCalendarOpen(false)}
        />
      ) : null}
    </article>
  );
}
