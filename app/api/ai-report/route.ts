import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/getAuthSession";
import { isBefore, parseISO, subDays, format } from "date-fns";

// 종목별 시간당 평균 칼로리 소모량 (kcal/hr, 체중 70kg 기준)
const CALORIE_MAP: Record<string, number> = {
  "러닝": 600, "달리기": 600, "조깅": 500,
  "수영": 500, "사이클": 550, "자전거": 550,
  "헬스": 350, "웨이트": 350, "근력": 350,
  "크로스핏": 650, "HIIT": 650,
  "축구": 550, "농구": 500, "배드민턴": 400, "테니스": 450,
  "요가": 250, "필라테스": 300, "스트레칭": 150,
  "등산": 500, "클라이밍": 480,
  "복싱": 600, "킥복싱": 620,
  "골프": 300, "볼링": 200,
};

function estimateCalories(category: string, count: number): number {
  const key = Object.keys(CALORIE_MAP).find(k => category.includes(k) || k.includes(category));
  const perSession = key ? CALORIE_MAP[key] * 0.75 : 300; // 기본 45분 운동 가정
  return Math.round(perSession * count);
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const { token, error } = await getAuthSession();

    if (error || !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 백엔드에서 최근 게시글 가져오기
    const backendUrl = process.env.NEXT_PUBLIC_SERVER_URL;
    const postsRes = await fetch(
      `${backendUrl}/api/member/${userId}/articles?page=0&size=100&sort=createdAt,DESC`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let posts: any[] = [];
    if (postsRes.ok) {
      const postsData = await postsRes.json();
      posts = postsData?.data?.content || [];
    }

    // 날짜별 필터
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);
    const oneDayAgo = subDays(new Date(), 1);

    // 최신 게시물 (24시간 내)
    const latestPost = posts[0] ?? null;
    const isLatestRecent = latestPost && !isBefore(parseISO(latestPost.createdAt), oneDayAgo);
    const latestCalories = isLatestRecent ? estimateCalories(latestPost.category, 1) : 0;

    const monthPosts = posts.filter((p: any) => {
      try { return !isBefore(parseISO(p.createdAt), thirtyDaysAgo); } catch { return false; }
    });
    const weekPosts = monthPosts.filter((p: any) => {
      try { return !isBefore(parseISO(p.createdAt), sevenDaysAgo); } catch { return false; }
    });

    const countByCategory = (arr: any[]) =>
      arr.reduce((acc: Record<string, number>, p: any) => {
        if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

    const weekCounts = countByCategory(weekPosts);
    const monthCounts = countByCategory(monthPosts);

    const weekCalories = Object.entries(weekCounts).reduce((total, [cat, cnt]) => total + estimateCalories(cat, cnt as number), 0);
    const monthCalories = Object.entries(monthCounts).reduce((total, [cat, cnt]) => total + estimateCalories(cat, cnt as number), 0);

    const topWeek = Object.entries(weekCounts).sort((a, b) => b[1] - a[1]);
    const topMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]);
    const activeDaysInMonth = new Set(
      monthPosts.map((p: any) => {
        try {
          return format(parseISO(p.createdAt), "yyyy-MM-dd");
        } catch {
          return null;
        }
      }).filter(Boolean)
    ).size;
    const activeDaysInWeek = new Set(
      weekPosts.map((p: any) => {
        try {
          return format(parseISO(p.createdAt), "yyyy-MM-dd");
        } catch {
          return null;
        }
      }).filter(Boolean)
    ).size;
    const monthCategoryDiversity = Object.keys(monthCounts).length;
    const weekCategoryDiversity = Object.keys(weekCounts).length;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(buildLocalReport(weekPosts, monthPosts, topWeek, topMonth, weekCalories, monthCalories, isLatestRecent ? latestPost : null, latestCalories));
    }

    const logsText = monthPosts.map((p: any) =>
      `- ${format(parseISO(p.createdAt), "M/d")}: ${p.category}${p.content ? ` (${String(p.content).substring(0, 30)})` : ""}`
    ).join("\n") || "기록 없음";

    const statsText = `이번 주: ${weekPosts.length}회, 약 ${weekCalories.toLocaleString()} kcal
이번 달: ${monthPosts.length}회, 약 ${monthCalories.toLocaleString()} kcal
이번 주 주력: ${topWeek.slice(0,3).map(([k,v])=>`${k}(${v}회)`).join(', ') || '없음'}`;
    const calorieGuideText = Object.entries(CALORIE_MAP)
      .map(([category, kcal]) => `- ${category}: ${kcal}kcal/hr (서비스 내부 추정 기준)`)
      .join("\n");
    const weekCategoryBreakdown = Object.entries(weekCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => `${category} ${count}회 / 약 ${estimateCalories(category, count as number).toLocaleString()}kcal`)
      .join(", ") || "없음";
    const monthCategoryBreakdown = Object.entries(monthCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => `${category} ${count}회 / 약 ${estimateCalories(category, count as number).toLocaleString()}kcal`)
      .join(", ") || "없음";
    const recentPatternText = monthPosts.slice(0, 10).map((p: any) =>
      `- ${format(parseISO(p.createdAt), "M/d")}: ${p.category}${p.content ? ` / ${String(p.content).substring(0, 40)}` : ""}`
    ).join("\n") || "최근 패턴 없음";

    const latestSection = isLatestRecent
      ? `\n방금 기록한 운동: ${latestPost.category}, 내용: "${String(latestPost.content ?? "").substring(0, 80)}", 추정 칼로리: ${latestCalories}kcal\n`
      : "";

    const latestFieldSpec = isLatestRecent
      ? `,\n  "latestFeedback": "방금 기록한 ${latestPost?.category}에 대한 즉각 피드백 + ${latestCalories}kcal 소모 언급 + 응원 (2~3문장)"`
      : "";

    const prompt = `너는 운동 기록을 해석해 주는 한국어 피트니스 코치다.
아래 "서비스 계산값"은 이미 서버에서 계산된 공식 수치이므로 그대로 신뢰하고, 임의로 다시 계산하거나 수정하지 마라.
운동별 칼로리 기준표는 해석 참고용이며, 설명의 근거를 풍부하게 만들기 위한 컨텍스트다.
답변은 과장 없이 구체적으로, 사용자의 실제 기록 패턴을 근거로 작성해라.
각 항목은 2~4문장 이내로 작성하고, 같은 표현을 반복하지 마라.

[서비스 계산 기준]
- 운동 1회 기본 길이: 45분
- 칼로리 계산은 서버에서 이미 반영됨

[운동별 칼로리 참고표]
${calorieGuideText}

[서비스 계산값]
${statsText}
- 이번 주 활동일 수: ${activeDaysInWeek}일
- 이번 달 활동일 수: ${activeDaysInMonth}일
- 이번 주 운동 다양성: ${weekCategoryDiversity}종목
- 이번 달 운동 다양성: ${monthCategoryDiversity}종목
- 이번 주 종목별 요약: ${weekCategoryBreakdown}
- 이번 달 종목별 요약: ${monthCategoryBreakdown}
${latestSection}
[최근 10개 패턴]
${recentPatternText}

[최근 30일 로그 최대 100개]
${logsText}

[작성 지침]
- calories: 이번 주와 이번 달 칼로리 흐름을 숫자와 함께 설명하고, 활동 빈도 또는 운동 구성과 연결해 해석해라.
- weeklyScore: 출석 빈도, 활동일 수, 운동 다양성을 함께 보고 0~100점으로 평가해라.
- bodyChange: 최근 30일 패턴을 근거로 한 달 후 기대 가능한 변화를 현실적으로 설명해라.
- weakness: 부족하거나 편중된 부분을 구체적으로 짚고, 왜 보완이 필요한지 말해라.
- nextWeekPlan: 사용자의 최근 패턴을 반영한 실행 가능한 다음 주 루틴을 제안해라. 총 횟수와 종목 조합이 드러나야 한다.
- funFact: 이번 달 운동량을 일상적인 비유로 재미있게 설명하라.
- latestFeedback: 최신 운동이 24시간 이내일 때만 작성하며, 방금 한 운동에 대한 즉각 피드백과 응원을 포함해라.
- 기록이 적으면 추측을 줄이고, 무리한 확정 표현 대신 가능성, 동기부여 유도 중심으로 써라.

JSON만 반환:
{
  "calories": "이번 주 칼로리 요약 + 이번 달 비교 (숫자 포함)",
  "weeklyScore": "이번 주 0~100점 + 한줄 평가",
  "bodyChange": "1개월 후 예상 신체 변화 (구체적)",
  "weakness": "부족한 운동 유형 + 이유",
  "nextWeekPlan": "다음 주 추천 루틴 (총 횟수 + 종목 조합)",
  "funFact": "이번 달 소모량 재미있는 비교"${latestFieldSpec}
}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-nano",
        messages: [
          { role: "system", content: "너는 한국어로 답하는 친절하고 동기부여 넘치는 피트니스 코치야. 반드시 JSON만 반환해." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("OpenAI error:", errText);
      return NextResponse.json(buildLocalReport(weekPosts, monthPosts, topWeek, topMonth, weekCalories, monthCalories, isLatestRecent ? latestPost : null, latestCalories));
    }

    const aiData = await aiRes.json();
    const content = aiData.choices[0].message.content.trim()
      .replace(/^```json\s*/i, "").replace(/^```/, "").replace(/```$/, "").trim();

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("AI Report Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildLocalReport(
  weekPosts: any[], monthPosts: any[],
  topWeek: [string, number][], topMonth: [string, number][],
  weekCal: number, monthCal: number,
  latestPost?: any, latestCalories?: number
) {
  const w = weekPosts.length;
  const m = monthPosts.length;
  const topW = topWeek[0]?.[0] ?? "기록 없음";

  const base = {
    calories: `이번 주 약 ${weekCal.toLocaleString()} kcal를 소모했어요. 이번 달 총 ${monthCal.toLocaleString()} kcal 소모!`,
    weeklyScore: w >= 5 ? `${Math.min(95, 70 + w * 4)}점 · 이번 주 정말 열심히 했어요!` :
                 w >= 3 ? `${60 + w * 5}점 · 꾸준한 페이스를 유지하고 있어요` :
                 w >= 1 ? `${40 + w * 10}점 · 조금만 더 자주 해봐요` : `30점 · 이번 주는 쉬었군요, 다음 주엔 파이팅!`,
    bodyChange: m >= 16 ? "이 페이스라면 한 달 후 근지구력과 체력이 눈에 띄게 향상될 거예요." :
                m >= 8 ? "꾸준히 유지하면 한 달 후 체중 감소 또는 근육량 소폭 증가가 기대돼요." :
                "운동 빈도를 주 3회 이상으로 늘리면 한 달 후 확실한 변화를 느낄 수 있어요.",
    weakness: topWeek.length <= 1
      ? `${topW}만 하고 있어요. 유연성(스트레칭/요가)도 함께 하면 부상 예방에 좋아요.`
      : "다양한 종목을 하고 있어요! 유산소와 근력을 균형있게 병행하는지 확인해보세요.",
    nextWeekPlan: w < 3
      ? `주 4회 목표로 ${topW} 2회 + 유산소(러닝/사이클) 1회 + 스트레칭 1회를 추천해요.`
      : `현재 페이스 유지하면서 ${topWeek[1]?.[0] ?? "다른 종목"}을 1~2회 추가해보세요.`,
    funFact: `이번 달 소모한 ${monthCal.toLocaleString()} kcal는 밥 약 ${Math.round(monthCal / 300)}공기에 해당해요! 🍚`,
  };

  if (latestPost && latestCalories) {
    return {
      ...base,
      latestFeedback: `방금 ${latestPost.category} 운동을 기록했어요! 약 ${latestCalories.toLocaleString()} kcal를 소모했어요. 오늘도 운동 완료, 정말 잘 했어요! 💪`,
    };
  }

  return base;
}

