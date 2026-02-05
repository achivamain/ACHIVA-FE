"use client";

import { NextStepButton } from "./Buttons";
import { useSignupInfoStore } from "@/store/SignupStore";
import { format } from "date-fns";
import { useRef, useState, useLayoutEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

const slides = [
  {
    title: "서로를 응원해요",
    content: `이 공간은 비교와 눈치없이,
열심히 운동하는 사람들을 위해 만들어졌습니다.

운동을 잘하든 못하든,
그 순간을 즐기는 모두를 위해
서로에게 응원을 건네주세요.`,
  },
  {
    title: "함께 만들어요",
    content: `오늘의 운동을 쌓아갑니다.
서로를 응원합니다.

아래 버튼을 눌러 우리의 문화에 함께하세요.`,
  },
];

export default function OathForm() {
  const user = useSignupInfoStore.use.user();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const updateWidth = () => {
      setContainerWidth(window.innerWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  async function handleSignUp() {
    setIsLoading(true);
    const payload = {
      profileImageUrl: user.profileImg || null,
      birth: format(user.birth!, "yyyy-MM-dd"),
      categories: user.categories,
    };

    try {
      const response = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("회원가입 중 서버 에러");
      }

      // 회원가입 시에 기본 목표 지정
      try {
        await fetch(`/api/goals/seed-defaults`, {
          method: "POST",
        });
      } catch (goalError) {
        console.error("기본 목표 생성 실패:", goalError);
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(
        "네트워크 혹은 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
    setIsLoading(false);
  }

  const isLastSlide = currentPage === slides.length - 1;

  return (
    <div className="w-full flex flex-col">
      {/* 제목 */}
      <div className="w-full text-left mb-4">
        <p className="font-semibold text-2xl leading-[29px] text-black">
          우리의 문화에 참여해요
        </p>
        <p className="font-light text-[15px] leading-[18px] text-[#808080] mt-2.5">
          게시물을 오른쪽으로 넘겨 다음 내용을 볼 수 있어요
        </p>
      </div>

      {/* 슬라이드 */}
      <div
        ref={containerRef}
        className="relative -mx-7 mt-11 mb-30"
        style={{ width: containerWidth || "100vw" }}
      >
        {/* 페이지 표시(1/2, 2/2 ..) */}
        <div
          ref={pageRef}
          className="absolute top-5 right-5 z-10 bg-black/35 px-4 py-1 rounded-full text-white text-[15px] font-medium"
        >
          {currentPage + 1}/{slides.length}
        </div>

        <Swiper
          modules={[Pagination]}
          onSlideChange={(swiper) => setCurrentPage(swiper.activeIndex)}
          className="w-full"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="w-full aspect-square flex flex-col justify-center px-5"
                style={{
                  backgroundColor: "#A6736F",
                  maxHeight: containerWidth || "100vw",
                }}
              >
                <h2 className="font-semibold text-[32px] leading-[38px] text-white mb-[30px]">
                  {slide.title}
                </h2>
                <p className="text-[17px] font-normal leading-[150%] text-white whitespace-pre-wrap">
                  {slide.content}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 버튼 */}
      <div className="px-0 mb-15">
        <NextStepButton
          disabled={!isLastSlide}
          isLoading={isLoading}
          onClick={handleSignUp}
        >
          동의하고 시작하기
        </NextStepButton>
      </div>
    </div>
  );
}
