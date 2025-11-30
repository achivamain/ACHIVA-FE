import {
  ThumbUpCheerIcon,
  FireCheerIcon,
  HeartCheerIcon,
  CloverCheerIcon,
} from "@/components/Icons";

export const cheeringMeta = {
  최고예요: {
    icon: ThumbUpCheerIcon,
    color: "#A6736F",
    label: "최고예요 👍",
  },
  수고했어요: {
    icon: FireCheerIcon,
    color: "#4B5373",
    label: "수고했어요 💕",
  },
  응원해요: {
    icon: HeartCheerIcon,
    color: "#D7A658",
    label: "응원해요 🔥",
  },
  동기부여: {
    icon: CloverCheerIcon,
    color: "#525D49",
    label: "동기부여 🍀",
  },
} as const;
