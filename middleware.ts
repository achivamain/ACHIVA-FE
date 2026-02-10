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
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sw") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".json")
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
    pathname !== "/signup-test" && // 회원가입 테스트용
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
  matcher: [
    /*
     * 아래 경로를 제외한 모든 경로에 미들웨어 적용:
     * - api (API routes)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico, sitemap.xml, robots.txt (메타데이터 파일)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
