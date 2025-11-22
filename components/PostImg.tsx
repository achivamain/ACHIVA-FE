"use client";
import { useState } from "react";
import Image from "next/image";

export default function PostImg({
  url,
  filtered = false,
}: {
  url: string;
  filtered?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  // URL 유효성 검사
  // URL이 없거나 빈 문자열이거나 "default"인 경우
  if (!url || url.trim() === "" || url === "default") {
    return null;
  }

  // URL이 올바른 형식인지 확인
  const isValidUrl =
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/");

  if (!isValidUrl) {
    console.error("Invalid URL format:", url);
    return null;
  }

  return (
    <div className="relative aspect-square w-full h-full">
      {!loaded && (
        <div>
          <div className="bg-loading absolute inset-0 animate-pulse"></div>
        </div>
      )}
      <Image
        className={`${loaded ? "" : "opacity-0"}`}
        src={url}
        alt="profile image"
        fill
        onLoad={() => setLoaded(true)}
      />
      {filtered && (
        <div className="absolute inset-0 w-full h-full bg-black/70" />
      )}
    </div>
  );
}
