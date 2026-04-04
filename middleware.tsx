import { NextResponse, userAgent } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { device } = userAgent(req);
  const isMobile = device.type === "mobile" || device.type === "tablet";
  const { pathname } = req.nextUrl;
  const authError = (req.auth as { error?: string } | null)?.error;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||

      // ✅ 추가: 네이버/구글 크롤러용 파일은 로그인/리다이렉트 없이 통과
    pathname === "/sitemap.xml" ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".txt") ||
    pathname.endsWith(".html") ||
    
    pathname.endsWith(".svg") || // 👈 확장자 기준 예외
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg")
  ) {
    return NextResponse.next();
  }
  const isLoggedIn = !!req.auth && !authError;

  // -------------------------
  // 1. 로그인 안 된 유저는 "/"로 강제 리다이렉트
  // -------------------------
  if (
    !isLoggedIn &&
    pathname !== "/" &&
    pathname !== "/auth/error" &&
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

    // Cognito 토큰의 닉네임과 실제 DB 닉네임이 다를 수 있으므로
    // 루트 진입에서는 닉네임 문자열을 직접 신뢰하지 않고 processing에서 최신 유저 정보를 조회한다.
    return NextResponse.redirect(new URL("/processing", req.url));
  }

  // -------------------------
  // 3. 모바일이면 모든 경로를 /m/... 로 rewrite
  // -------------------------
  if (isMobile) {
    const url = req.nextUrl.clone();
    if (!url.pathname.startsWith("/callback")) {
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
  matcher: ["/((?!_next|api|sitemap.xml|robots.txt).*)"],
};
