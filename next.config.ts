import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["achivadata.s3.ap-northeast-2.amazonaws.com"],
  },
  async redirects() {
    return [
      {
        source: "/terms",
        destination:
          "https://achivamain.notion.site/?p=247f9799dbb880859f08f64d81bc6335&pm=c", // 이용약관
        permanent: true,
      },
      {
        source: "/privacy",
        destination:
          "https://achivamain.notion.site/?p=247f9799dbb8800b8057d9fe46809e08&pm=c", // 개인정보 처리방침
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
