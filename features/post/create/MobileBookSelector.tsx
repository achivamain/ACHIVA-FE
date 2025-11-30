import { BookCard, BookCardSkeleton } from "@/components/BookCard";
import { LoadingIcon } from "@/components/Icons";
import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import type { Book } from "@/types/Book";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";

export default function BookSelector() {
  const setPost = useDraftPostStore.use.setPost();
  const handleNextStep = useCreatePostStepStore.use.handleNextStep();
  const handlePrevStep = useCreatePostStepStore.use.handlePrevStep();

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

  //자동로딩 관련
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

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentElem = loaderRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
          return;
        }
      },
      { rootMargin: "100px" }
    );
    io.observe(currentElem!);

    return () => {
      io.unobserve(currentElem!);
      io.disconnect();
    };
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  const books: Book[] = data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <div className="h-full flex-1 flex flex-col justify-between gap-8 m-4 flex-1 overflow-y-auto min-h-0">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ">
        {books.length !== 0 &&
          books.map((book) => (
            <div
              key={book.id}
              className="h-full flex-1 flex flex-col cursor-pointer"
              onClick={() => {
                setPost({ category: book.category });
                setPost({ book: book });
                handleNextStep();
              }}
            >
              <BookCard book={{ ...book, count: book.count + 1 }} />
            </div>
          ))}
        {(isFetchingNextPage) &&
          [0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-full flex-1 flex flex-col">
              <BookCardSkeleton width={162} />
            </div>
          ))}
        <div
          className="h-full flex-1 flex flex-col cursor-pointer"
          onClick={() => {
            handlePrevStep();
            handlePrevStep();
          }}
        >
          <div className="aspect-[3/4] rounded-md relative shadow-sm bg-[#EDEDED]">
            <div className="absolute top-2 right-[3px] px-[11px] py-[2px] gap-2 text-[#412A2A] bg-white border border-[#D9D9D9] rounded-md font-semibold">
              운동 {/*이거 필요한가...?*/}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M39 6H9C8.20435 6 7.44129 6.31607 6.87868 6.87868C6.31607 7.44129 6 8.20435 6 9V39C6 39.7957 6.31607 40.5587 6.87868 41.1213C7.44129 41.6839 8.20435 42 9 42H39C39.7957 42 40.5587 41.6839 41.1213 41.1213C41.6839 40.5587 42 39.7957 42 39V9C42 8.20435 41.6839 7.44129 41.1213 6.87868C40.5587 6.31607 39.7957 6 39 6ZM39 39H9V9H39V39ZM33 24C33 24.3978 32.842 24.7794 32.5607 25.0607C32.2794 25.342 31.8978 25.5 31.5 25.5H25.5V31.5C25.5 31.8978 25.342 32.2794 25.0607 32.5607C24.7794 32.842 24.3978 33 24 33C23.6022 33 23.2206 32.842 22.9393 32.5607C22.658 32.2794 22.5 31.8978 22.5 31.5V25.5H16.5C16.1022 25.5 15.7206 25.342 15.4393 25.0607C15.158 24.7794 15 24.3978 15 24C15 23.6022 15.158 23.2206 15.4393 22.9393C15.7206 22.658 16.1022 22.5 16.5 22.5H22.5V16.5C22.5 16.1022 22.658 15.7206 22.9393 15.4393C23.2206 15.158 23.6022 15 24 15C24.3978 15 24.7794 15.158 25.0607 15.4393C25.342 15.7206 25.5 16.1022 25.5 16.5V22.5H31.5C31.8978 22.5 32.2794 22.658 32.5607 22.9393C32.842 23.2206 33 23.6022 33 24Z"
                  fill="#C3C3C3"
                />
              </svg>
            </div>
          </div>
          <div className="pl-4 pr-4 h-full flex-1 flex flex-col">
            <p className="font-semibold text-lg mt-3">새로운 이야기</p>
            <p className="font-light text-[#808080] text-sm">첫번째 이야기</p>
          </div>
        </div>
      </div>
      {isFetchingNextPage && (
        <div className="w-full flex my-2 justify-center">
          <LoadingIcon color="text-theme" />
        </div>
      )}
      <div className="w-full h-10">{}</div>
      <div ref={loaderRef}></div>
    </div>
  );
}
