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
  // 모바일일 땐 화면 너비에서 px-5만큼 뺀 값
  const size = isMobile ? window.innerWidth - 40 : 480;
  const setPost = useDraftPostStore.use.setPost();
  const handleNextStep = useCreatePostStepStore.use.handleNextStep();
  const input = useRef<HTMLInputElement | null>(null);

  //swiper 관련
  const swiperPrevRef = useRef<HTMLButtonElement | null>(null);
  const swiperNextRef = useRef<HTMLButtonElement | null>(null);
  const swiperPageRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isBeginningPage, setIsBeginning] = useState(false);
  const [isEndPage, setIsEnd] = useState(false);

  //이미지 업로드 및 크롭 기능
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
        /*다음 페이지로 넘어갔다가 다시 되돌아오는 경우 어떻게 되는지(업로드가 중복으로 되나?)
          확인 필요*/
      }));
      handleNextStep();
    },
    maxImages: 5, //최대 5장까지
  });

  //이미지 추가시 추가된 이미지로 페이지 이동
  useEffect(() => {
    if (swiperRef.current && images.length > 0) {
      swiperRef.current.slideTo(images.length - 1);
    }
  }, [images.length]);

  return (
    <div className=" flex flex-col items-center justify-center h-full">
      {images.length == 0 && (
        <div
          className="flex flex-col justify-center items-center 
        aspect-square w-full 
        gap-4
        sm:w-120"
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M67.25 0.0625H4.75C3.5068 0.0625 2.31451 0.55636 1.43544 1.43544C0.55636 2.31451 0.0625 3.5068 0.0625 4.75V67.25C0.0625 68.4932 0.55636 69.6855 1.43544 70.5646C2.31451 71.4436 3.5068 71.9375 4.75 71.9375H67.25C68.4932 71.9375 69.6855 71.4436 70.5646 70.5646C71.4436 69.6855 71.9375 68.4932 71.9375 67.25V4.75C71.9375 3.5068 71.4436 2.31451 70.5646 1.43544C69.6855 0.55636 68.4932 0.0625 67.25 0.0625ZM3.1875 67.25V4.75C3.1875 4.3356 3.35212 3.93817 3.64515 3.64515C3.93817 3.35212 4.3356 3.1875 4.75 3.1875H67.25C67.6644 3.1875 68.0618 3.35212 68.3549 3.64515C68.6479 3.93817 68.8125 4.3356 68.8125 4.75V38.7344L56.5039 26.4219C56.0684 25.9849 55.551 25.6381 54.9812 25.4016C54.4114 25.165 53.8005 25.0432 53.1836 25.0432C52.5667 25.0432 51.9558 25.165 51.386 25.4016C50.8162 25.6381 50.2988 25.9849 49.8633 26.4219L7.48438 68.8125H4.75C4.3356 68.8125 3.93817 68.6479 3.64515 68.3549C3.35212 68.0618 3.1875 67.6644 3.1875 67.25ZM67.25 68.8125H11.9141L52.082 28.6445C52.2271 28.4993 52.3995 28.384 52.5892 28.3054C52.7788 28.2267 52.9822 28.1863 53.1875 28.1863C53.3928 28.1863 53.5962 28.2267 53.7858 28.3054C53.9755 28.384 54.1479 28.4993 54.293 28.6445L68.8125 43.1641V67.25C68.8125 67.6644 68.6479 68.0618 68.3549 68.3549C68.0618 68.6479 67.6644 68.8125 67.25 68.8125ZM23.5 31.3125C25.0452 31.3125 26.5556 30.8543 27.8404 29.9959C29.1252 29.1374 30.1265 27.9173 30.7178 26.4897C31.3091 25.0622 31.4638 23.4913 31.1624 21.9759C30.8609 20.4604 30.1169 19.0683 29.0243 17.9757C27.9317 16.8831 26.5396 16.1391 25.0241 15.8376C23.5087 15.5362 21.9378 15.6909 20.5103 16.2822C19.0827 16.8735 17.8626 17.8748 17.0041 19.1596C16.1457 20.4444 15.6875 21.9548 15.6875 23.5C15.6875 25.572 16.5106 27.5591 17.9757 29.0243C19.4409 30.4894 21.428 31.3125 23.5 31.3125ZM23.5 18.8125C24.4271 18.8125 25.3334 19.0874 26.1042 19.6025C26.8751 20.1176 27.4759 20.8496 27.8307 21.7062C28.1855 22.5627 28.2783 23.5052 28.0974 24.4145C27.9166 25.3238 27.4701 26.159 26.8146 26.8146C26.159 27.4701 25.3238 27.9166 24.4145 28.0974C23.5052 28.2783 22.5627 28.1855 21.7062 27.8307C20.8496 27.4759 20.1176 26.8751 19.6025 26.1042C19.0874 25.3334 18.8125 24.4271 18.8125 23.5C18.8125 22.2568 19.3064 21.0645 20.1854 20.1854C21.0645 19.3064 22.2568 18.8125 23.5 18.8125Z"
              fill="#412A2A"
            />
          </svg>
          <p className="text-center text-xl text-theme font-medium">
            이미지를 업로드해주세요
          </p>
        </div>
      )}

      {/* 크롭 영역 */}
      {images.length > 0 && (
        <div className="relative w-full sm:w-120 aspect-square">
          {!isMobile && (
            <div className="absolute flex justify-between w-full top-1/2 p-3 ">
              <button
                ref={swiperPrevRef}
                className="
        flex justify-center items-center
        z-5 -translate-y-1/2
        w-[30px] h-[30px]
        bg-white rounded-full opacity-50"
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
                ref={swiperNextRef}
                className="
        flex justify-center items-center
        z-5 -translate-y-1/2
        w-[30px] h-[30px]
        bg-white rounded-full opacity-50"
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
            </div>
          )}
          <Swiper
            className="w-full sm:w-120 aspect-square"
            pagination={{
              el: swiperPageRef.current,
              type: "fraction",
            }}
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
          >
            <div className="relative aspect-square bg-black/5 rounded-md">
              {images.map((image, idx) => (
                <SwiperSlide key={idx}>
                  <Cropper
                    image={image.imageSrc}
                    crop={image.crop}
                    zoom={image.zoom}
                    minZoom={image.minZoom || 1}
                    onMediaLoaded={(mediaSize) => {
                      const { width, height } = mediaSize; // 원본 이미지 크기
                      const zoomByWidth = size / width;
                      const zoomByHeight = size / height;

                      updateImageZoom(
                        image.id,
                        Math.max(zoomByWidth, zoomByHeight),
                      ); // cropSize 꽉 차도록 zoom 조정
                      setMinZoom(image.id, Math.max(zoomByWidth, zoomByHeight));
                      // 줌 최솟값 -> cropSize 꽉 차게
                      // 이미지가 cropSize보다 작아지면 문제가 생길 것 같아서 추가하였음.
                    }}
                    aspect={1} // 정사각형
                    cropSize={{ width: size, height: size }}
                    onCropChange={(crop) => updateImageCrop(image.id, crop)}
                    onZoomChange={(zoom) => updateImageZoom(image.id, zoom)}
                    onCropComplete={(area, pixs) =>
                      onCropComplete(image.id, area, pixs)
                    }
                    restrictPosition={true}
                    showGrid={true}
                    objectFit="contain"
                  />
                  <button
                    className="absolute flex justify-center items-center
                      right-3 top-7 -translate-y-1/2 z-5 
                      w-[60px] h-[30px]
                      font-semibold text-theme
                      bg-white border border-[#D9D9D9] rounded-sm
                      "
                    onClick={() => removeImage(image.id)}
                  >
                    삭제
                  </button>
                </SwiperSlide>
              ))}
            </div>
          </Swiper>
        </div>
      )}

      {images.length > 0 ? (
        <>
          <div className="mt-5 w-full h-[50px]">
            <NextStepButton
              // disabled={isUploading}
              isLoading={isUploading}
              onClick={onUpload}
            >
              다음
            </NextStepButton>
          </div>
          <div className="mt-2 w-full">
            <button
              className="flex items-center justify-center
            py-2 w-full h-11 
            font-medium text-lg text-[#5C5C5C]
            bg-[#E3E3E3] rounded-sm "
              onClick={() => {
                // RN 환경에서는 카메라 요청, 아니면 파일인풋 클릭
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(
                    JSON.stringify({ type: "REQUEST_CAMERA" }),
                  );
                } else {
                  input.current?.click();
                }
              }}
            >
              사진 더 추가하기
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-5 w-full">
            <NextStepButton
              // disabled={isUploading}
              isLoading={isUploading}
              onClick={() => {
                // RN 환경에서는 카메라 요청, 아니면 파일인풋 클릭
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(
                    JSON.stringify({ type: "REQUEST_CAMERA" }),
                  );
                } else {
                  input.current?.click();
                }
              }}
            >
              {isMobile ? "갤러리에서 선택" : "컴퓨터에서 선택"}
            </NextStepButton>
          </div>
          <div className="mt-2 w-full">
            <button
              className="flex items-center justify-center
            py-2 w-full h-11 
            font-medium text-lg text-[#5C5C5C]
            bg-[#E3E3E3] rounded-sm "
              onClick={handleNextStep}
            >
              건너뛰기
            </button>
          </div>
        </>
      )}

      {/* 파일 입력 */}
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
