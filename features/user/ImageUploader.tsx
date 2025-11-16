"use client";

import { useEffect, useRef } from "react";
import useImageUploader from "@/hooks/useImageUploader";
import Cropper from "react-easy-crop";
import { ProfileImgUploadIcon } from "@/components/Icons";
import { LoadingIcon } from "@/components/Icons";

type Props = {
  setProfileImageUrl: (url: string) => void;
};

export default function ImageUploader({ setProfileImageUrl }: Props) {
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
      setProfileImageUrl(src);
    },
  });

  useEffect(() => {
    dialog.current?.showModal();
  }, [imageSrc]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: "REQUEST_CAMERA" })
            );
          } else {
            input.current?.click();
          }
        }}
        className="absolute bottom-0 right-0"
      >
        <ProfileImgUploadIcon />
      </button>

      {/* 파일 입력 */}
      <input
        ref={input}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
      {/* 크롭 영역 */}
      {imageSrc && (
        <dialog
          ref={dialog}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:rounded-xl z-20 max-w-none max-h-none w-screen h-dvh sm:w-lg sm:h-auto p-5 flex flex-col justify-center"
        >
          <div
            className="relative w-full bg-black/5 rounded-md overflow-hidden"
            style={{ height: 320 }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // 정사각형
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition={true}
              showGrid={true}
              objectFit="contain"
            />
          </div>

          {/* 액션 버튼 */}
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
              className="flex items-center justify-center px-4 py-2 rounded-md
                         bg-theme text-white text-sm font-medium
                         border border-theme
                         disabled:opacity-80 disabled:cursor-default"
            >
              {isUploading ? <LoadingIcon /> : "제출"}
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
