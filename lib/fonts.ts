import localFont from "next/font/local";
import { Inter, Urbanist } from "next/font/google";

export const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
});
