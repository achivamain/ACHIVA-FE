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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(buildLocalReport(weekPosts, monthPosts, topWeek, topMonth, weekCalories, monthCalories, isLatestRecent ? latestPost : null, latestCalories));
    }

    const logsText = monthPosts.slice(0, 50).map((p: any) =>
      `- ${format(parseISO(p.createdAt), "M/d")}: ${p.category}${p.content ? ` (${String(p.content).substring(0, 30)})` : ""}`
    ).join("\n") || "기록 없음";

    const statsText = `이번 주: ${weekPosts.length}회, 약 ${weekCalories.toLocaleString()} kcal
이번 달: ${monthPosts.length}회, 약 ${monthCalories.toLocaleString()} kcal
이번 주 주력: ${topWeek.slice(0,3).map(([k,v])=>`${k}(${v}회)`).join(', ') || '없음'}`;

    const latestSection = isLatestRecent
      ? `\n방금 기록한 운동: ${latestPost.category}, 내용: "${String(latestPost.content ?? "").substring(0, 80)}", 추정 칼로리: ${latestCalories}kcal\n`
      : "";

    const latestFieldSpec = isLatestRecent
      ? `,\n  "latestFeedback": "방금 기록한 ${latestPost?.category}에 대한 즉각 피드백 + ${latestCalories}kcal 소모 언급 + 응원 (2~3문장)"`
      : "";

    const prompt = `사용자 운동 데이터:\n${statsText}\n${latestSection}\n최근 일지:\n${logsText}\n\nJSON만 반환:\n{\n  "calories": "이번 주 칼로리 요약 + 이번 달 비교 (숫자 포함)",\n  "weeklyScore": "이번 주 0~100점 + 한줄 평가",\n  "bodyChange": "1개월 후 예상 신체 변화 (구체적)",\n  "weakness": "부족한 운동 유형 + 이유",\n  "nextWeekPlan": "다음 주 추천 루틴 (총 횟수 + 종목 조합)",\n  "funFact": "이번 달 소모량 재미있는 비교"${latestFieldSpec}\n}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
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
    let content = aiData.choices[0].message.content.trim()
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

