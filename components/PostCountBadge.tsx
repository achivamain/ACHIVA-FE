"use client";

import { useEffect, useState } from "react";
import type { PostsData } from "@/types/responses";

type PostCountBadgeProps = {
  userId: string;
};

export default function PostCountBadge({ userId }: PostCountBadgeProps) {
  const [postCount, setPostCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPostCount() {
      try {
        setIsLoading(true);
        // pageParam=0 & size=1 is enough to get the totalElements from the pagination metadata
        const response = await fetch(
          `/api/members/getPosts?id=${userId}&pageParam=0&size=1&sort=DESC`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch posts");

        const json = await response.json();
        const data = json.data as PostsData;

        // Use totalElements if available, otherwise just use content length as fallback
        setPostCount(data.totalElements || data.content.length);
      } catch (error) {
        console.error("Error fetching post count:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchPostCount();
    }
  }, [userId]);

  if (isLoading) return null; // Don't show while loading to prevent layout shift
  if (postCount === 0) return null; // Optional: don't show if 0 posts

  return (
    <div className="flex items-center gap-1 bg-gradient-to-r from-orange-50 to-orange-100 px-2 py-0.5 rounded-full border border-orange-200 shadow-sm whitespace-nowrap">
      <span className="text-[10px] leading-none mb-[1px]">🔥</span>
      <span className="text-[10px] font-bold text-orange-600 leading-none">
        {postCount.toLocaleString()}
      </span>
    </div>
  );
}
