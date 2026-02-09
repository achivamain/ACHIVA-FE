# ACHIVA-FE

어치바(ACHIVA) 프론트엔드 프로젝트입니다.

## 시작하기 (Getting Started)

### 1. 필수 요구사항
- Node.js 18+
- pnpm (패키지 매니저)

### 2. 설치
의존성 패키지를 설치합니다.

```bash
pnpm install
```

### 3. 환경 변수 설정
로컬 개발을 위해 환경 변수 설정이 필요합니다.  
`.env.template` 파일을 복사하여 `.env.local` 파일을 생성하고, 필요한 값을 채워주세요.

```bash
cp .env.template .env.local
```

`.env.local` 필수 항목:
- `AUTH_SECRET`: NextAuth 비밀키
- `AUTH_COGNITO_ID`: AWS Cognito 클라이언트 ID
- `AUTH_COGNITO_ISSUER`: AWS Cognito 발급자 URL
- `NEXT_PUBLIC_SERVER_URL`: 백엔드 API URL
- `NEXTAUTH_URL`: `http://localhost:3000` (로컬 개발 시)

### 4. 개발 서버 실행

```bash
pnpm dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주요 스크립트

- `pnpm dev`: 개발 모드로 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 빌드된 애플리케이션 실행
- `pnpm lint`: 린트 검사

## 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State/Query**: Zustand, TanStack Query
- **Auth**: NextAuth.js (v5 beta)
