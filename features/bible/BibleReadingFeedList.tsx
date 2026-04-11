"use client";

import { useMemo } from "react";
import BibleReadingFeedCard from "@/features/bible/BibleReadingFeedCard";
import {
  getLatestBiblePostsByAuthor,
  useBibleReadingFeed,
} from "@/features/bible/feedStore";

export default function BibleReadingFeedList({
  onlyMine = false,
}: {
  onlyMine?: boolean;
}) {
  const { posts } = useBibleReadingFeed();
  const visiblePosts = onlyMine ? posts.filter((post) => post.memberId === "me") : posts;
  const latestPosts = useMemo(
    () => getLatestBiblePostsByAuthor(visiblePosts),
    [visiblePosts],
  );
  const postsByAuthor = useMemo(() => {
    return visiblePosts.reduce<Record<string, typeof visiblePosts>>((acc, post) => {
      const key = post.memberId || post.memberNickName;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(post);
      return acc;
    }, {});
  }, [visiblePosts]);

  if (latestPosts.length === 0) {
    return (
      <div className="rounded-[20px] border border-dashed border-gray-200 bg-[#FAFAF8] px-4 py-5 text-[13px] leading-6 text-[#8A817A]">
        아직 공유된 성경일독 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {latestPosts.map((post) => (
        <BibleReadingFeedCard
          key={post.id}
          post={post}
          authorPosts={postsByAuthor[post.memberId || post.memberNickName] ?? [post]}
        />
      ))}
    </div>
  );
}
