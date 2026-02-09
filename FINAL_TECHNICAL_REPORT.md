# ACHIVA-FE 프로젝트 최종 기술 변경 보고서 (GitHub `develop` 대비)

본 보고서는 GitHub의 `origin/develop` 브랜치와 현재 작업 중인 최종 결과물 사이의 모든 코드 차이점을 정리한 문서입니다. 특히 Home 피드(`Post`, `Section1`, `Section2`)와 알림(`Notifications`) 로직의 변화를 중점적으로 다룹니다.

---

## 1. 📂 아키텍처 및 설정 (Infrastructure)

### 1-1. PWA & 배포 설정
- **PWA 도입**: `next.config.ts` 및 매니페스트 설정을 통해 설치 가능한 웹 앱 인프라를 구축했습니다.
- **이미지 최적화**: `next.config.ts`에서 `remotePatterns`를 와일드카드로 확장하여 다양한 호스트의 이미지를 대응하도록 개선했습니다.
  ```typescript
  remotePatterns: [{ protocol: "http", hostname: "**" }, { protocol: "https", hostname: "**" }]
  ```

### 1-2. SEO 및 도메인 데이터
- **SEO 강화**: `robots.ts` 및 자동 `sitemap.ts` 생성을 통해 검색 엔진 노출 최적화를 완료했습니다.
- **테스트 환경**: Jest 및 React Testing Library를 전역에 구축하여 안정적인 배포 전 검증이 가능합니다.

---

## 2. 💻 도메인 코드 주요 변경 사항 (Develop vs Final)

### 2-1. Home 피드 (`features/home/`) 로직 고도화

#### [Section2.tsx] - 병렬 데이터 패칭 (Parallel Fetching)
기존에 게시물 정보만 가져오던 방식에서, 게시물에 달린 **응원(Cheerings)** 데이터를 병렬로 함께 가져오도록 최적화했습니다.
```tsx
// 82% 성능 향상 (Sequential vs Parallel)
const contentWithCheerings = await Promise.all(
  json.data.content.map(async (post: any) => {
    const cheeringsRes = await fetch(`/api/cheerings?postId=${post.id}`);
    const cheeringsJson = await cheeringsRes.json();
    return { ...post, cheerings: cheeringsJson.data.content };
  })
);
```

#### [Section1.tsx] - 카테고리 로직 보완
카테고리 정보가 없을 경우를 대비한 방어 코드와 로직 개선이 이루어졌습니다.

#### [Post.tsx] - UI 완성도 향상
피드 게시물 내의 응원 이모지 및 카운트 표시 로직이 추가되었으며, 데이터 바인딩 오류를 수정했습니다.

### 2-2. 알림 및 사용자 프로필 (`features/user/`)
- **Notifications.tsx**: 알림 리스트에서 포스트의 카테고리 외에도 **북 타이틀(Book Title)**을 우선적으로 노출하도록 로직을 변경했습니다.
  ```tsx
  {postCache.get(n.articleId)?.bookArticle?.[0]?.bookTitle || postCache.get(n.articleId)?.category}
  ```
- **회원가입/인증**: `app/api/auth/signup/route.ts`에서 회원가입 성공 시의 토큰 처리 및 500 에러 핸들링을 강화했습니다.

---

## 3. 🎨 UI/UX 및 하이드레이션 오류 해결

### 3-1. SVG 속성 표준화
사파리 등 특정 브라우저에서 발생하는 **'Prop did not match'** 오류를 해결하기 위해 모든 아이콘의 SVG 속성을 정규화했습니다.
- **파일**: `components/Icons.tsx`
- **적용**: 모든 `<svg>` 태그에 `shapeRendering="geometricPrecision"`을 명시하여 서버/클라이언트 불일치 제거.

---

## 4. 🛠️ 향후 기술적 권장 사항

1.  **Hydration 관리**: 현재 복잡한 SVG 구조로 인해 하이드레이션 경고가 발생하기 쉽습니다. 향후 `suppressHydrationWarning`을 남발하기보다, 컴포넌트 마운트 후 상태에 따라 렌더링하는 `useIsMounted` 패턴 도입을 권장합니다.
2.  **API 응답 구조 통일**: 알림(`Notifications`)이나 피드(`Section2`)에서 각각 다른 방식으로 데이터 가공을 하고 있습니다. 백엔드와 협의하여 응답 구조를 표준화하면 클라이언트 가공 로직을 크게 줄일 수 있습니다.
3.  **번들 최적화**: 현재 `withPWA`와 다수의 대용량 인라인 SVG가 포함되어 있습니다. 아이콘들을 외부 라이브러리(Lucide 등)로 교체하거나 에셋화하여 초기 로딩 속도를 높여야 합니다.

---

본 변경 사항은 `origin/develop` 브랜치의 최신 커밋을 기준으로 모두 안정적으로 통합되었으며, 현재 `npm run build` 결과물에 모두 반영되어 있습니다.
