"use client";
import Image from "next/image";
import { useState } from "react";
import { defaultProfileImg } from "@/features/user/defaultProfileImg";

type ProfileImgProps = {
  url?: string;
  size: number;
};
// 나중에 수정 수정 필요
export default function ProfileImg({ url, size }: ProfileImgProps) {
  const [loaded, setLoaded] = useState(false);

  // URL 유효성 검사 - "default" 문자열이거나 빈 값이면 기본 이미지 사용
  const isValidUrl = url && url.trim() !== "" && url !== "default";
  const imageUrl = isValidUrl ? url : defaultProfileImg;

  return (
    <div
      style={{ width: size, height: size }}
      className={`aspect-square rounded-full overflow-hidden relative`}
    >
      {!loaded && (
        <div>
          <div className="bg-loading absolute inset-0 animate-pulse"></div>
        </div>
      )}
      <Image
        className={`w-full h-full object-cover ${loaded ? "" : "opacity-0"}`}
        src={imageUrl}
        alt="profile image"
        width={size}
        height={size}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
