"use client";
//이전 페이지 다음 페이지 아이콘 따로 분리

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Book } from "@/types/Book";
import BookCard from "@/components/BookCard";
import { LoadingIcon } from "@/components/Icons";

export function MobileBookSection() {
  const bookRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const currentPage = useRef<number>(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const pageSize = useRef(0);

  async function fetchBooks(pageParam: number = 0) {
    const response = await fetch(
      `/api/books?pageParam=${pageParam}&sizeParam=5`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["books"],
      queryFn: ({ pageParam = 0 }) => fetchBooks(pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined;
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
    });

  //로딩용
  useEffect(() => {
    const currentElem = loaderRef.current;
    const io = new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
          return;
        }
      },
      { root: viewportRef.current, rootMargin: "0px" }
    );
    io.observe(currentElem!);

    return () => {
      io.unobserve(currentElem!);
      io.disconnect();
    };
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  const books: Book[] = data?.pages.flatMap((page) => page.content) ?? [];

  const scrollToPage = (index: number) => {
    const el = bookRefs.current.get(Math.round(index));
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  useEffect(() => {
    if (viewportRef.current) {
      pageSize.current = Math.floor(viewportRef.current.offsetWidth / 197);
    }
  });

  return (
    <div className="relative w-full items-center">
      <h1 className="text-[26px] font-semibold m-4 mb-1">나의 성취 이야기</h1>
      <div className="flex flex-row items-center">
        <div
          className="inline-flex overflow-x-auto"
          style={{
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
          ref={viewportRef}
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="flex-shrink-0 w-[181px] m-2"
              ref={(el) => {
                if (el) {
                  bookRefs.current.set(books.indexOf(book), el);
                }
              }}
            >
              <BookCard book={book} width={181} />
            </div>
          ))}
          <div ref={loaderRef}></div>
          {isFetchingNextPage && (
            <div className="w-full flex my-2 justify-center">
              <LoadingIcon color="text-theme" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
