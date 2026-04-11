# 성경 일독 FE 전달사항

## 개요

- 성경 일독은 기존 `article` 시스템 위에 추가되었습니다.
- 성경 메타데이터는 FE/BE가 각각 정적 상수로 보유합니다.
- 성경 게시글도 기존 `cheering` API를 그대로 사용합니다.

## 신규 API

### 1. 내 성경 권별 진도 조회

- `GET /api/scripture-reading/progress/me`

응답 예시:

```json
{
  "status": "success",
  "code": 200,
  "message": "내 성경 권별 진도 조회 성공",
  "data": {
    "items": [
      {
        "scriptureId": "요한복음",
        "completedChapters": 5,
        "updatedAt": "2026-04-11T10:30:00"
      }
    ]
  }
}
```

비고:

- `completedChapters > 0` 인 데이터만 내려갑니다.
- 목록에 없는 성경 권은 FE에서 `0장`으로 간주하면 됩니다.

### 2. 내 특정 성경 권 진도 저장

- `PUT /api/scripture-reading/progress/me/scriptures/{scriptureId}`

요청 예시:

```json
{
  "completedChapters": 5
}
```

응답 예시:

```json
{
  "status": "success",
  "code": 200,
  "message": "성경 권 진도 저장 성공",
  "data": {
    "scriptureId": "요한복음",
    "completedChapters": 5,
    "updatedAt": "2026-04-11T10:30:00"
  }
}
```

비고:

- 백엔드는 감소도 허용합니다.
- 감소 방지는 FE 정책으로 처리해야 합니다.

### 3. 성경 일독 게시글 생성

- `POST /api/scripture-reading/articles`

요청 예시:

```json
{
  "scriptureId": "요한복음",
  "startChapter": 3,
  "endChapter": 4,
  "completedChapters": 5,
  "content": "오늘은 이 구절이 오래 남았어요.",
  "readAt": "2026-04-11"
}
```

비고:

- `content` 는 필수입니다.
- `readAt` 이 없으면 서버에서 게시글 생성일 기준으로 처리합니다.
- 게시글 생성이 진도를 자동 갱신하지는 않습니다.

### 4. 특정 회원 월별 성경 일독 기록 조회

- `GET /api/members/{memberId}/scripture-reading/articles/calendar?yearMonth=2026-04`

응답 예시:

```json
{
  "status": "success",
  "code": 200,
  "message": "월별 성경 일독 기록 조회 성공",
  "data": {
    "yearMonth": "2026-04",
    "items": [
      {
        "articleId": "11111111-1111-1111-1111-111111111111",
        "createdAt": "2026-04-11T10:00:00",
        "content": "오늘은 이 구절이 오래 남았어요.",
        "scriptureReading": {
          "scriptureId": "요한복음",
          "startChapter": 3,
          "endChapter": 4,
          "completedChapters": 5,
          "readAt": "2026-04-11"
        }
      }
    ]
  }
}
```

비고:

- 달력 조회 기준 날짜는 `readAt` 입니다.
- 정렬은 `readAt DESC`, 같은 날짜에서는 `createdAt DESC` 입니다.

## 기존 article 응답 확장

- 기존 게시글 조회 API에서 성경 일독 게시글이면 `scriptureReading` 필드가 추가됩니다.
- 대상 API:
- `GET /api/articles/{articleId}`
- `GET /api/articles/categories/{category}`
- `GET /api/members/{memberId}/categories/{category}/articles`

응답 특징:

- `category` 는 `"성경 일독"` 입니다.
- `title` 은 서버에서 `"요한복음 3장-4장"` 형태로 생성합니다.
- `photoUrls` 는 빈 배열입니다.
- `backgroundColor` 는 `null` 입니다.
- 본문은 `question[0]` 에 들어갑니다.

예시:

```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "title": "요한복음 3장-4장",
  "category": "성경 일독",
  "question": [
    {
      "question": "성경 일독 본문",
      "content": "오늘은 이 구절이 오래 남았어요."
    }
  ],
  "photoUrls": [],
  "backgroundColor": null,
  "scriptureReading": {
    "scriptureId": "요한복음",
    "startChapter": 3,
    "endChapter": 4,
    "completedChapters": 5,
    "readAt": "2026-04-11"
  }
}
```

## FE 주의사항

- 성경 게시글 본문은 `question[0].content` 로 읽으면 됩니다.
- `question[0].question` 값은 현재 `"성경 일독 본문"` 이지만, 문구 자체에 강하게 의존하지 않는 편이 안전합니다.
- 진도 감소 금지는 FE에서 막아야 합니다.
- 게시글 삭제 후 진도는 되돌아가지 않습니다.
- 성경 권 ID는 한글 문자열입니다. 경로 파라미터에 넣을 때 URL 인코딩이 필요할 수 있습니다.
