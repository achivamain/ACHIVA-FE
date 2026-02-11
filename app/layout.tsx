import type { Metadata } from "next";
import { pretendard } from "@/lib/fonts";
import "./globals.css";
import Wrapper from "@/QueryClientProvider";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "나는오늘운동한다 | 운동 기록 SNS",
  description: "오늘 한 운동을 기록하고 공유하는 운동 기록 SNS, 나는오늘운동한다",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "나는오늘운동한다",
    description: "오늘 한 운동을 기록하고 공유하는 운동 기록 SNS",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="naver-site-verification"
          content="bd7f12f57eb6ced6c90bbf5c55a9084ef9c6fb8e"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
        <Script
          type="text/javascript"
          id="clarity-script"
          strategy="afterInteractive"
        >
          {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "tds01box2e");`}
        </Script>
      </head>
      <body className={`${pretendard.className} antialiased min-h-dvh`}>
        <SessionProviderWrapper>
          <Wrapper>{children}</Wrapper>
        </SessionProviderWrapper>

        <Analytics />
      </body>
    </html>
  );
}
