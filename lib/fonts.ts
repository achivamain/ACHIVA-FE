import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});
