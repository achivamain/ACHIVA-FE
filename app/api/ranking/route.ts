import { NextRequest, NextResponse } from "next/server";

type UserRankData = {
  memberId: number;
  nickName: string;
  profileImageUrl: string | null;
  postCount: number;     // 누적 인증 횟수 (온도 계산 기준)
  weeklyCount: number;   // 이번 주 운동 횟수
  streakWeeks: number;   // 연속 달성 주
  category?: string;     // 종목별 쿼리 시 사용
  title?: string;        // 대표 칭호
};

const BASE: UserRankData[] = [
  { memberId: 1,  nickName: "이재현", profileImageUrl: null, postCount: 68,  weeklyCount: 6, streakWeeks: 12, title: "👑 헬스 열정왕" },
  { memberId: 2,  nickName: "김민준", profileImageUrl: null, postCount: 59,  weeklyCount: 5, streakWeeks: 8 , title: "🔥 러닝 열정러" },
  { memberId: 3,  nickName: "박서윤", profileImageUrl: null, postCount: 53,  weeklyCount: 7, streakWeeks: 5 , title: "👑 수영 열정왕" },
  { memberId: 4,  nickName: "최유진", profileImageUrl: null, postCount: 46,  weeklyCount: 4, streakWeeks: 10, title: "🔥 요가 열정러" },
  { memberId: 5,  nickName: "정하늘", profileImageUrl: null, postCount: 41,  weeklyCount: 5, streakWeeks: 6 , title: "🔥 사이클 열정러" },
  { memberId: 6,  nickName: "한지수", profileImageUrl: null, postCount: 37,  weeklyCount: 3, streakWeeks: 4 , title: "🔥 축구 열정러" },
  { memberId: 7,  nickName: "오승민", profileImageUrl: null, postCount: 33,  weeklyCount: 6, streakWeeks: 3 , title: "🔥 맨몸운동 열정러" },
  { memberId: 8,  nickName: "신예린", profileImageUrl: null, postCount: 29,  weeklyCount: 4, streakWeeks: 7 , title: "🔥 테니스 열정러" },
  { memberId: 9,  nickName: "임도현", profileImageUrl: null, postCount: 24,  weeklyCount: 2, streakWeeks: 2 , title: "🔥 농구 열정러" },
  { memberId: 10, nickName: "강태양", profileImageUrl: null, postCount: 20,  weeklyCount: 3, streakWeeks: 1  },
];

// 종목별 상위 유저 (다른 조합)
const BY_CATEGORY: Record<string, UserRankData[]> = {
  "헬스":   [BASE[0], BASE[1], BASE[5], BASE[9], BASE[8]],
  "러닝":   [BASE[2], BASE[4], BASE[7], BASE[6], BASE[3]],
  "축구":   [BASE[6], BASE[1], BASE[0], BASE[8], BASE[4]],
  "수영":   [BASE[3], BASE[2], BASE[9], BASE[5], BASE[7]],
  "요가":   [BASE[7], BASE[5], BASE[2], BASE[3], BASE[4]],
  "농구":   [BASE[1], BASE[6], BASE[0], BASE[8], BASE[9]],
  "맨몸운동": [BASE[0], BASE[6], BASE[4], BASE[2], BASE[9]],
  "사이클": [BASE[2], BASE[4], BASE[0], BASE[9], BASE[5]],
  "배드민턴": [BASE[3], BASE[7], BASE[1], BASE[5], BASE[8]],
  "클라이밍": [BASE[9], BASE[0], BASE[3], BASE[6], BASE[2]],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  if (category) {
    const list = BY_CATEGORY[category] ?? [];
    if (list.length === 0) return NextResponse.json({ data: [] });

    // 동일 선수가 여러 종목에 등장할 때 count 살짝 조정
    const scored = list.map((u, i) => ({
      rank: i + 1,
      ...u,
      postCount: Math.max(5, u.postCount - i * 5), // 종목별 인증 수 (전체보다 적음)
    }));
    return NextResponse.json({ data: scored });
  }

  // 전체 랭킹
  return NextResponse.json({
    data: BASE.map((u, i) => ({ rank: i + 1, ...u })),
  });
}
