import type { StaticImageData } from "next/image";
import imgGeneral from "@/public/images/categories/01_weightTraining.webp";
import imgPrayer from "@/public/images/categories/08_yoga.webp";
import imgMeditation from "@/public/images/categories/09_hiking.webp";
import imgBible from "@/public/images/categories/04_tableTennis.webp";

export const categories = ["일반", "기도", "묵상", "성경"] as const;

export type Category = (typeof categories)[number];

export const categoryImages: Record<Category, StaticImageData> = {
  일반: imgGeneral,
  기도: imgPrayer,
  묵상: imgMeditation,
  성경: imgBible,
};

// 임시 디자인 연결용 기본 높이
export const categoryImageHeights: Record<Category, number> = {
  일반: 42,
  기도: 42,
  묵상: 42,
  성경: 42,
};
