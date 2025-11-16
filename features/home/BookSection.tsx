"use client";
//이전 페이지 다음 페이지 아이콘 따로 분리

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Book } from "@/types/Book";
import BookCard from "@/components/BookCard";
import { LoadingIcon } from "@/components/Icons";

export function BookSection() {
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
      <h1 className="text-[28px] font-semibold m-10">나의 성취 이야기</h1>
      <div className="flex flex-row items-center">
        <button
          onClick={() => {
            currentPage.current = Math.max(0, currentPage.current - 1);
            scrollToPage(currentPage.current * pageSize.current);
          }}
          className="flex-shrink-0 m-2 mb-16 w-8 h-8 flex items-center justify-center z-10"
          aria-label="이전 페이지"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M9.29195 15.2924L19.2919 5.29243C19.3849 5.19952 19.4952 5.12582 19.6165 5.07554C19.7379 5.02526 19.8681 4.99937 19.9994 4.99937C20.1308 4.99937 20.2609 5.02526 20.3823 5.07554C20.5037 5.12582 20.614 5.19952 20.7069 5.29243C20.7999 5.38534 20.8736 5.49564 20.9238 5.61703C20.9741 5.73843 21 5.86854 21 5.99993C21 6.13133 20.9741 6.26143 20.9238 6.38283C20.8736 6.50422 20.7999 6.61452 20.7069 6.70743L11.4132 15.9999L20.7069 25.2924C20.8946 25.4801 21 25.7346 21 25.9999C21 26.2653 20.8946 26.5198 20.7069 26.7074C20.5193 26.8951 20.2648 27.0005 19.9994 27.0005C19.7341 27.0005 19.4796 26.8951 19.2919 26.7074L9.29195 16.7074C9.19897 16.6146 9.12521 16.5043 9.07489 16.3829C9.02456 16.2615 8.99866 16.1313 8.99866 15.9999C8.99866 15.8685 9.02456 15.7384 9.07489 15.617C9.12521 15.4956 9.19897 15.3853 9.29195 15.2924Z"
              fill="#343330"
            />
          </svg>
        </button>

        <div
          className="inline-flex overflow-hidden gap-4"
          ref={viewportRef}
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="flex-shrink-0 w-[181px]"
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

        <button
          onClick={() => {
            currentPage.current =
              currentPage.current < Math.floor(books.length / pageSize.current)
                ? currentPage.current + 1
                : currentPage.current;
            scrollToPage(currentPage.current * pageSize.current);
          }}
          className="flex-shrink-0 m-2 mb-16 w-8 h-8 flex items-center justify-center z-10"
          aria-label="다음 페이지"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M22.7081 16.7076L12.7081 26.7076C12.6151 26.8005 12.5048 26.8742 12.3835 26.9245C12.2621 26.9747 12.132 27.0006 12.0006 27.0006C11.8692 27.0006 11.7391 26.9747 11.6177 26.9245C11.4963 26.8742 11.386 26.8005 11.2931 26.7076C11.2001 26.6147 11.1264 26.5044 11.0762 26.383C11.0259 26.2616 11 26.1315 11 26.0001C11 25.8687 11.0259 25.7386 11.0762 25.6172C11.1264 25.4958 11.2001 25.3855 11.2931 25.2926L20.5868 16.0001L11.2931 6.70757C11.1054 6.51993 11 6.26543 11 6.00007C11 5.7347 11.1054 5.48021 11.2931 5.29257C11.4807 5.10493 11.7352 4.99951 12.0006 4.99951C12.2659 4.99951 12.5204 5.10493 12.7081 5.29257L22.7081 15.2926C22.801 15.3854 22.8748 15.4957 22.9251 15.6171C22.9754 15.7385 23.0013 15.8687 23.0013 16.0001C23.0013 16.1315 22.9754 16.2616 22.9251 16.383C22.8748 16.5044 22.801 16.6147 22.7081 16.7076Z"
              fill="#343330"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
