import type { StaticImageData } from "next/image";
import imgGrace from "@/public/images/categories/cat_grace.png";
import imgChurch from "@/public/images/categories/cat_church.png";
import imgBible from "@/public/images/categories/cat_bible.png";

export const categories = ["오늘 은혜", "성경 일독", "교회 앨범"] as const;

export type Category = (typeof categories)[number];

export const categoryImages: Record<Category, StaticImageData> = {
  "오늘 은혜": imgGrace,
  "교회 앨범": imgChurch,
  "성경 일독": imgBible,
};

// HMR 리로드 강제 트리거
export const categoryImageHeights: Record<Category, number> = {
  "오늘 은혜": 42,
  "교회 앨범": 42,
  "성경 일독": 42,
};
