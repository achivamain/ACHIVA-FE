"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Pagination, Navigation } from "swiper/modules";
import type { PostRes } from "@/types/Post";
import { ContentPage, TitlePage } from "./Pages";
import PostImg from "@/components/PostImg";

export default function Post({
  post,
  handleSlideChange = undefined,
}: {
  post: PostRes;
  handleSlideChange?: (idx: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const [isBeginning, setIsBeginning] = useState(false);
  const [isEnd, setIsEnd] = useState(false);

  // hover 시에만 보이게 하기 위함
  const [isNavShowing, setIsNavShowing] = useState(false);
  const navTimerRef = useRef<number | null>(null);

  return (
    <div
      className="relative w-full"
      onPointerMove={() => {
        if (navTimerRef.current !== null) {
          window.clearTimeout(navTimerRef.current);
          navTimerRef.current = null;
        }
        setIsNavShowing(true);
        navTimerRef.current = window.setTimeout(() => {
          setIsNavShowing(false);
          navTimerRef.current = null;
        }, 1000);
      }}
    >
      <button
        ref={prevRef}
        className={`${
          isBeginning ? "!hidden" : ""
        } absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex justify-center items-center z-5 bg-white rounded-full w-[30px] h-[30px] ${
          isNavShowing ? "opacity-50" : "opacity-0"
        } transition-opacity duration-300 shadow`}
      >
        <svg
          width="9"
          height="15"
          viewBox="0 0 9 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.9375 13.5938L1.84375 7.5L7.9375 1.40625"
            stroke="#412A2A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        ref={nextRef}
        className={`${
          isEnd ? "!hidden" : ""
        } absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex justify-center items-center z-5 bg-white rounded-full w-[30px] h-[30px] ${
          isNavShowing ? "opacity-50" : "opacity-0"
        } transition-opacity duration-300 shadow`}
      >
        <svg
          width="9"
          height="15"
          viewBox="0 0 9 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.0625 1.40625L7.15625 7.5L1.0625 13.5937"
            stroke="#412A2A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        ref={pageRef}
        style={{
          top: "20px",
          right: "20px",
          bottom: "auto",
          left: "auto",
          height: "28px",
          width: "52px",
          color: "white",
        }}
        className={`z-5 absolute bg-black/35 text-[15px] flex items-center justify-center text-white rounded-full ${
          isNavShowing ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      ></div>
      <div ref={containerRef}>
        <Swiper
          pagination={{
            el: pageRef.current,
            type: "fraction",
          }}
          watchOverflow={false} // 1장이어도 pagination 보이게
          navigation={{ prevEl: null, nextEl: null }}
          modules={[Pagination, Navigation]}
          onBeforeInit={(swiper) => {
            if (swiper.params.navigation) {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
            }
            if (swiper.params.pagination) {
              // @ts-ignore
              swiper.params.pagination.el = pageRef.current;
            }
          }}
          onSwiper={(sw) => {
            swiperRef.current = sw;
            setIsBeginning(sw.isBeginning);
            setIsEnd(sw.isEnd);
          }}
          onSlideChange={(sw) => {
            if (handleSlideChange) {
              handleSlideChange(sw.activeIndex);
            }
            setIsBeginning(sw.isBeginning);
            setIsEnd(sw.isEnd);
          }}
          className="mySwiper"
        >
          {post.createdAt && (
            <SwiperSlide>
              <TitlePage size={containerWidth ?? 0} post={post} />
            </SwiperSlide>
          )}
          {post.question.map((page, idx) => {
            return (
              <SwiperSlide key={idx}>
                <ContentPage
                  size={containerWidth ?? 0}
                  page={page}
                  backgroundColor={post.backgroundColor}
                />
              </SwiperSlide>
            );
          })}
          {post.photoUrl && (
            <SwiperSlide>
              <PostImg url={post.photoUrl} />
            </SwiperSlide>
          )}
        </Swiper>
      </div>
    </div>
  );
}
