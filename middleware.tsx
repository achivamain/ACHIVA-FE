import { NextResponse, userAgent } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { device } = userAgent(req);
  const isMobile = device.type === "mobile" || device.type === "tablet";
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.endsWith(".svg") || // 👈 확장자 기준 예외
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg")
  ) {
    return NextResponse.next();
  }
  const isLoggedIn = !!req.auth;

  // -------------------------
  // 1. 로그인 안 된 유저는 "/"로 강제 리다이렉트
  // -------------------------
  if (
    !isLoggedIn &&
    pathname !== "/" &&
    pathname !== "/login" &&
    pathname !== "/signup" &&
    pathname !== "/signup-test" && // 회원가입 Test Entry Point
    pathname !== "/callback" &&
    pathname !== "/onboarding"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // -------------------------
  // 2. "/" 경로 처리
  // -------------------------
  if (pathname === "/") {
    if (!isLoggedIn) {
      return NextResponse.rewrite(new URL("/onboarding", req.url));
    }

    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // -------------------------
  // 3. 모바일이면 모든 경로를 /m/... 로 rewrite
  // -------------------------
  if (isMobile) {
    const url = req.nextUrl.clone();
    const isNextAction = req.headers.has("next-action");

    if (
      !url.pathname.startsWith("/callback") &&
      !url.pathname.startsWith("/m") &&
      !isNextAction
    ) {
      url.pathname = `/m${pathname}`;
    }
    const res = NextResponse.rewrite(url);

    res.headers.set(
      "Vary",
      "User-Agent, Sec-CH-UA-Mobile, Sec-CH-UA-Platform, Viewport-Width"
    );

    return res;
  }

  // -------------------------
  // 4. 데스크탑은 그대로 진행
  // -------------------------
  return NextResponse.next();
});

export const config = {
  matcher: "/:path*", // 모든 경로 적용
};
