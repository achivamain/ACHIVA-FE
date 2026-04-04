"use client";
import { useEffect, useRef, useState } from "react";
import { useMultiImageUploader } from "@/hooks/useImageUploader";
import Cropper from "react-easy-crop";
import { NextStepButton } from "./Buttons";
import {
  useCreatePostStepStore,
  useDraftPostStore,
} from "@/store/CreatePostStore";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Pagination, Navigation } from "swiper/modules";

export default function ImageUploader() {
  const isMobile = window.innerWidth < 640;
  const size = isMobile ? window.innerWidth - 40 : 480;
  const setPost = useDraftPostStore.use.setPost();
  const handleNextStep = useCreatePostStepStore.use.handleNextStep();
  const input = useRef<HTMLInputElement | null>(null);

  const swiperPrevRef = useRef<HTMLButtonElement | null>(null);
  const swiperNextRef = useRef<HTMLButtonElement | null>(null);
  const swiperPageRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBeginningPage, setIsBeginning] = useState(false);
  const [isEndPage, setIsEnd] = useState(false);

  const {
    images,
    isUploading,
    onFileChange,
    onCropComplete,
    onUpload,
    updateImageCrop,
    updateImageZoom,
    setMinZoom,
    removeImage,
  } = useMultiImageUploader({
    apiUrl: "/api/posts/upload",
    onUploadCompleted: (srcs: string[]) => {
      setPost((draft) => ({
        ...draft,
        photoUrls: srcs,
      }));
      handleNextStep();
    },
    maxImages: 5,
  });

  useEffect(() => {
    if (swiperRef.current && images.length > 0) {
      swiperRef.current.slideTo(images.length - 1);
    }
  }, [images.length]);

  const openFilePicker = () => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "REQUEST_CAMERA" }),
      );
    } else {
      input.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">

      {/* 빈 상태 — 업로드 유도 영역 */}
      {images.length === 0 && (
        <button
          onClick={openFilePicker}
          className="relative flex flex-col justify-center items-center
            aspect-square w-full sm:w-120
            rounded-2xl overflow-hidden
            border-2 border-dashed border-[#C0A898]
            bg-gradient-to-br from-[#fdf6f0] to-[#f0e8e0]
            hover:from-[#f5ede4] hover:to-[#e8dbd0]
            transition-all duration-300 group cursor-pointer"
        >
          {/* 배경 흐릿한 원 장식 */}
          <div className="absolute w-48 h-48 rounded-full bg-[#e8c9b0]/30 blur-3xl top-8 left-8" />
          <div className="absolute w-36 h-36 rounded-full bg-[#f0b090]/20 blur-2xl bottom-12 right-12" />

          {/* 아이콘 */}
          <div
            className="relative z-10 flex flex-col items-center gap-5
              transition-transform duration-300 group-hover:scale-105"
          >
            <div
              className="flex items-center justify-center
                w-20 h-20 rounded-full
                bg-white/70 backdrop-blur-sm
                shadow-[0_8px_32px_rgba(100,60,30,0.12)]
                border border-white/80"
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path
                  d="M18 3v18M9 12l9-9 9 9"
                  stroke="#7A5040"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 24v5a3 3 0 003 3h22a3 3 0 003-3v-5"
                  stroke="#7A5040"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-[18px] font-bold text-[#412A2A] mb-1">
                {isMobile ? "갤러리에서 사진 선택" : "사진을 업로드하세요"}
              </p>
              <p className="text-[13px] text-[#7A5040]/70 font-medium">
                최대 5장 · 정사각형으로 편집됩니다
              </p>
            </div>
          </div>
        </button>
      )}

      {/* 크롭 영역 */}
      {images.length > 0 && (
        <div className="relative w-full sm:w-120 aspect-square rounded-2xl overflow-hidden shadow-xl">
          {/* 페이지 인디케이터 */}
          <div
            ref={swiperPageRef}
            className="absolute top-3 right-3 z-10
              bg-black/40 backdrop-blur-sm text-white text-[12px] font-medium
              px-3 py-1 rounded-full min-w-[48px] text-center"
          />

          {/* 네비게이션 버튼 (PC) */}
          {!isMobile && (
            <>
              <button
                ref={swiperPrevRef}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                  w-9 h-9 flex items-center justify-center
                  bg-black/40 backdrop-blur-sm text-white rounded-full
                  hover:bg-black/60 transition-all duration-200
                  disabled:opacity-0"
              >
                <svg width="8" height="14" viewBox="0 0 9 15" fill="none">
                  <path d="M7.9375 13.5938L1.84375 7.5L7.9375 1.40625" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                ref={swiperNextRef}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                  w-9 h-9 flex items-center justify-center
                  bg-black/40 backdrop-blur-sm text-white rounded-full
                  hover:bg-black/60 transition-all duration-200"
              >
                <svg width="8" height="14" viewBox="0 0 9 15" fill="none">
                  <path d="M1.0625 1.40625L7.15625 7.5L1.0625 13.5937" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <Swiper
            className="w-full sm:w-120 aspect-square"
            pagination={{ el: swiperPageRef.current, type: "fraction" }}
            navigation={{ prevEl: null, nextEl: null }}
            modules={[Pagination, Navigation]}
            onBeforeInit={(swiper) => {
              if (swiper.params.navigation) {
                // @ts-ignore
                swiper.params.navigation.prevEl = swiperPrevRef.current;
                // @ts-ignore
                swiper.params.navigation.nextEl = swiperNextRef.current;
              }
              if (swiper.params.pagination) {
                // @ts-ignore
                swiper.params.pagination.el = swiperPageRef.current;
              }
            }}
            onSwiper={(sw) => {
              swiperRef.current = sw;
              setIsBeginning(sw.isBeginning);
              setIsEnd(sw.isEnd);
            }}
            onSlideChange={(sw) => {
              setCurrentPage(sw.activeIndex + 1);
              setIsBeginning(sw.isBeginning);
              setIsEnd(sw.isEnd);
            }}
            simulateTouch={false}
            allowTouchMove={true}
          >
            <div className="relative aspect-square bg-black rounded-2xl">
              {images.map((image, idx) => (
                <SwiperSlide key={idx}>
                  <Cropper
                    image={image.imageSrc}
                    crop={image.crop}
                    zoom={image.zoom}
                    minZoom={image.minZoom || 1}
                    onMediaLoaded={(mediaSize) => {
                      const { width, height } = mediaSize;
                      const zoomByWidth = size / width;
                      const zoomByHeight = size / height;
                      updateImageZoom(image.id, Math.max(zoomByWidth, zoomByHeight));
                      setMinZoom(image.id, Math.max(zoomByWidth, zoomByHeight));
                    }}
                    aspect={1}
                    cropSize={{ width: size, height: size }}
                    onCropChange={(crop) => updateImageCrop(image.id, crop)}
                    onZoomChange={(zoom) => updateImageZoom(image.id, zoom)}
                    onCropComplete={(area, pixs) => onCropComplete(image.id, area, pixs)}
                    restrictPosition={true}
                    showGrid={true}
                    objectFit="contain"
                  />
                  {/* 삭제 버튼 */}
                  <button
                    className="absolute top-3 left-3 z-10
                      flex items-center gap-1.5 px-3 py-1.5
                      bg-black/50 backdrop-blur-sm text-white text-[12px] font-semibold
                      rounded-full hover:bg-black/70 transition-all duration-200"
                    onClick={() => removeImage(image.id)}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    삭제
                  </button>
                </SwiperSlide>
              ))}
            </div>
          </Swiper>
        </div>
      )}

      {/* 하단 버튼 */}
      {images.length > 0 ? (
        <div className="w-full flex flex-col gap-2">
          <NextStepButton isLoading={isUploading} onClick={onUpload}>
            다음
          </NextStepButton>
          <button
            className="flex items-center justify-center gap-2
              w-full h-11 rounded-xl
              font-semibold text-[15px] text-[#412A2A]/45
              bg-[#f0e8e0]
              border border-[#C0A898]/50
              transition-all duration-200
              cursor-not-allowed"
            onClick={openFilePicker}
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="#412A2A" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
            </svg>
            사진 더 추가하기
          </button>
        </div>
      ) : (
        <div className="w-full">
          <button
            className="flex items-center justify-center
              w-full h-11 rounded-xl
              font-medium text-[15px] text-[#7A5040]/70
              bg-transparent hover:bg-[#f0e8e0]
              border border-[#C0A898]/40
              transition-all duration-200"
            onClick={handleNextStep}
          >
            사진 없이 계속하기
          </button>
        </div>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          onFileChange(e);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
