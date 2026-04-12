"use client";
import { useState } from "react";
import Image from "next/image";

const DEFAULT_BG = "/default-post-bg.png";

export default function PostImg({
  url,
}: {
  url: string | null;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = url || DEFAULT_BG;
  return (
    <div className="relative aspect-square w-full h-full">
      {!loaded && (
        <div>
          <div className="bg-loading absolute inset-0 animate-pulse"></div>
        </div>
      )}
      <Image
        className={`${loaded ? "" : "opacity-0"}`}
        src={src}
        alt="post background"
        fill
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
