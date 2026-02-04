"use client";

import { useRef, useEffect } from "react";
import { NextStepButton, SkipButton } from "./Buttons";
import { useSignupInfoStore, useSignupStepStore } from "@/store/SignupStore";
import useImageUploader from "@/hooks/useImageUploader";
import Cropper from "react-easy-crop";
import { LoadingIcon } from "@/components/Icons";

export default function ProfileImageForm() {
  const setUser = useSignupInfoStore.use.setUser();
  const user = useSignupInfoStore.use.user();
  const handleNextStep = useSignupStepStore.use.handleNextStep();

  const dialog = useRef<HTMLDialogElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  const {
    imageSrc,
    crop,
    zoom,
    isUploading,
    onFileChange,
    onCropComplete,
    onUpload,
    setCrop,
    setZoom,
    resetAll,
  } = useImageUploader({
    apiUrl: "/api/members/upload",
    onUploadCompleted: (src: string) => {
      dialog.current?.close();
      setUser({ profileImg: src });
    },
  });

  useEffect(() => {
    if (imageSrc) {
      dialog.current?.showModal();
    }
  }, [imageSrc]);

  function handleSkip() {
    setUser({ profileImg: undefined });
    handleNextStep();
  }

  function handleNext() {
    handleNextStep();
  }

  function handleImageClick() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "REQUEST_CAMERA" })
      );
    } else {
      input.current?.click();
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full text-left">
        <p className="font-semibold text-2xl leading-[29px] text-black">
          프로필 사진을 등록해주세요
        </p>
      </div>

      {/* 프로필 이미지 영역 - 눌러서 사용 */}
      <div className="flex items-center justify-center pt-[50px] pb-[50px]">
        <button
          type="button"
          onClick={handleImageClick}
          className="w-[140px] h-[140px] rounded-full border border-theme overflow-hidden flex items-center justify-center bg-white"
        >
          {user.profileImg ? (
            <img
              src={user.profileImg}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {/* 사진 자르는 부분(Crop Dialog) */}
      {imageSrc && (
        <dialog
          ref={dialog}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl z-20 max-w-none max-h-none w-[calc(100vw-40px)] h-auto p-5 flex flex-col justify-center"
        >
          <div
            className="relative w-full bg-black/5 rounded-md overflow-hidden"
            style={{ height: 320 }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition={true}
              showGrid={true}
              objectFit="contain"
              cropShape="round"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={resetAll}
              type="button"
              className="px-4 py-2 rounded-md border border-theme text-sm text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={onUpload}
              disabled={isUploading}
              className="flex items-center justify-center px-4 py-2 rounded-md bg-theme text-white text-sm font-medium border border-theme disabled:opacity-80 disabled:cursor-default"
            >
              {isUploading ? <LoadingIcon /> : "확인"}
            </button>
          </div>
        </dialog>
      )}

      {/* 버튼 영역 */}
      <div className="w-full flex flex-col gap-2.5">
        {user.profileImg ? (
          <>
            <SkipButton disabled>건너뛰기</SkipButton>
            <NextStepButton onClick={handleNext}>다음</NextStepButton>
          </>
        ) : (
          <>
            <NextStepButton onClick={handleSkip}>건너뛰기</NextStepButton>
            <SkipButton disabled>다음</SkipButton>
          </>
        )}
      </div>
    </div>
  );
}

