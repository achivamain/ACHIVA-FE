import {
  ThumbUpCheerIcon,
  FireCheerIcon,
  HeartCheerIcon,
} from "@/components/Icons";

export const CHEERING_CATEGORIES = [
  "최고예요",
  "감사해요",
  "기도해요",
] as const;

export type CheeringCategory = (typeof CHEERING_CATEGORIES)[number];
type CheerIcon = typeof ThumbUpCheerIcon;

type CheeringMeta = {
  icon: CheerIcon;
  color: string;
  label: string;
};

export const cheeringMeta: Record<CheeringCategory, CheeringMeta> = {
  최고예요: {
    icon: ThumbUpCheerIcon,
    color: "#A6736F",
    label: "👍 최고예요",
  },
  감사해요: {
    icon: HeartCheerIcon,
    color: "#4B5373",
    label: "🙌 감사해요",
  },
  기도해요: {
    icon: FireCheerIcon,
    color: "#525D49",
    label: "🙏 기도해요",
  },
};
