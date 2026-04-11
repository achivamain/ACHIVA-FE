"use client";

import BibleReadingFeedCard from "@/features/bible/BibleReadingFeedCard";
import type { ScriptureReadingFeedPost } from "@/features/bible/types";

export default function BibleReadingFeedList({
  posts,
}: {
  posts: ScriptureReadingFeedPost[];
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-gray-200 bg-[#FAFAF8] px-4 py-5 text-[13px] leading-6 text-[#8A817A]">
        아직 공유된 성경일독 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y-4 divide- divide-[#ECECEC]">
      {posts.map((post) => (
        <BibleReadingFeedCard key={post.id} post={post} />
      ))}
    </div>
  );
}
