"use client";

import { LoadingIcon } from "@/components/Icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { TitlePage } from "../post/Pages";
import type { PostsData } from "@/types/responses";
import Link from "next/link";
import { Category, categories } from "@/types/Categories";
import type { CategoryCount } from "@/types/Post";
import { AnimatePresence, motion } from "motion/react";

export default function Posts({ userId }: { userId: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const size = containerWidth ? (containerWidth - 2) / 3 : 0;

  const [allCategories, setAllcategories] = useState<(Category | "전체")[]>([
    "전체",
    ...categories,
  ]);
  const [category, setCategory] = useState<Category | "전체">("전체");
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    async function fetchPostsCategory() {
      const response = await fetch(
        `/api/members/postsCategory?userId=${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { data } = await response.json();

      setAllcategories([
        "전체",
        ...data.categoryCounts.reduce((acc: Category[], c: CategoryCount) => {
          if (c.count > 0) {
            return [...acc, c.category];
          } else {
            return acc;
          }
        }, []),
      ]);
    }
    fetchPostsCategory();
  }, [userId]);

  async function fetchPosts(pageParam: number = 0) {
    // 포스트 데이터 가져오기
    const url =
      category === "전체"
        ? `/api/members/getPosts?pageParam=${pageParam}&id=${userId}&sort=DESC`
        : `/api/members/getCategoryPosts?pageParam=${pageParam}&id=${userId}&category=${category}&sort=DESC`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Failed to fetch");
    const json = await response.json();
    return json.data as PostsData;
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["posts", userId, category],
      queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined; // 더 없음
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
      // initialData: { pages: [initialPosts], pageParams: [0] },
    });

  // 센티넬 IO
  const loaderRef = useRef(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px 0px" }
    );
    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((p) => p.content) ?? [];
  const postsCnt = data?.pages[0]?.totalElements ?? 0;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between font-medium text-sm mb-2">
        <p className="text-theme/50">
          게시글 <span>{postsCnt}</span>
        </p>
        <CategorySelector
          allCategories={allCategories}
          category={category}
          setCategory={setCategory}
          isCategorySelectorOpen={isCategorySelectorOpen}
          setIsCategorySelectorOpen={setIsCategorySelectorOpen}
        />
      </div>
      {isLoading && (
        <div className="w-full flex justify-center">
          <LoadingIcon color="text-theme" />
        </div>
      )}
      {posts.length === 0 && !isLoading && (
        <div className="flex-1 flex flex-col justify-center text-center text-[#7f7f7f]">
          <p>여기에 당신의 성취 기록이 담겨요</p>
          <p>첫 성취를 기록해보세요</p>
        </div>
      )}
      <div ref={containerRef} className="grid grid-cols-3 gap-[1px]">
        {posts.map((post) => {
          return (
            <Link key={post.id} href={`/post/${post.id}`} scroll={false}>
              <TitlePage size={size} post={post} />
            </Link>
          );
        })}
      </div>
      <div ref={loaderRef}></div>
      {isFetchingNextPage && (
        <div className="w-full flex my-2 justify-center">
          <LoadingIcon color="text-theme" />
        </div>
      )}
    </div>
  );
}

type CategorySelectorType = {
  allCategories: (Category | "전체")[];
  category: Category | "전체";
  setCategory: React.Dispatch<React.SetStateAction<Category | "전체">>;
  isCategorySelectorOpen: boolean;
  setIsCategorySelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function CategorySelector({
  allCategories,
  category,
  setCategory,
  isCategorySelectorOpen,
  setIsCategorySelectorOpen,
}: CategorySelectorType) {
  useEffect(() => {
    function handleClickDocument() {
      setIsCategorySelectorOpen(false);
    }
    if (isCategorySelectorOpen) {
      document.addEventListener("click", handleClickDocument);
    }
    return () => {
      document.removeEventListener("click", handleClickDocument);
    };
  }, [isCategorySelectorOpen, setIsCategorySelectorOpen]);

  return (
    <>
      <div className="relative">
        <button
          className="flex items-center gap-1"
          onClick={() => setIsCategorySelectorOpen(true)}
        >
          <p className="text-sm font-medium text-theme">{category}</p>
          <svg
            width="15"
            height="16"
            viewBox="0 0 15 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.6849 6.85386L7.99744 11.5414C7.93211 11.6069 7.85449 11.6589 7.76903 11.6944C7.68356 11.7299 7.59193 11.7482 7.49939 11.7482C7.40685 11.7482 7.31522 11.7299 7.22975 11.6944C7.14428 11.6589 7.06666 11.6069 7.00134 11.5414L2.31384 6.85386C2.18175 6.72177 2.10754 6.54261 2.10754 6.35581C2.10754 6.16901 2.18175 5.98985 2.31384 5.85776C2.44593 5.72567 2.62508 5.65146 2.81189 5.65146C2.99869 5.65146 3.17785 5.72567 3.30994 5.85776L7.49997 10.0478L11.69 5.85718C11.8221 5.72509 12.0013 5.65088 12.1881 5.65088C12.3749 5.65088 12.554 5.72509 12.6861 5.85718C12.8182 5.98927 12.8924 6.16842 12.8924 6.35522C12.8924 6.54203 12.8182 6.72118 12.6861 6.85327L12.6849 6.85386Z"
              fill="#343330"
            />
          </svg>
        </button>
        {isCategorySelectorOpen && (
          <ul className="absolute top-7 right-0 bg-white z-[51] w-20 rounded-md overflow-hidden">
            {allCategories.map((c) => (
              <li
                onClick={() => setCategory(c as Category | "전체")}
                className={`text-center py-1.5 cursor-pointer text-[#808080] hover:text-theme hover:bg-gray-100 ${c === category ? "!text-theme font-semibold" : ""
                  }`}
                key={c}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
      <AnimatePresence>
        {isCategorySelectorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          />
        )}
      </AnimatePresence>
    </>
  );
}
