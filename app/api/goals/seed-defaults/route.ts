// 초기 목표 고정값 생성 proxy api

// POST api/goals/seed-defaults - 초기 목표 생성
// GET api/goals/seed-defaults - 개발용 URL 접근
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// 기본 목표 데이터
const defaultGoals = [
  { category: "VISION", text: "어제보다 더 멋진 나" },
  { category: "MISSION", text: "일주일에 두 번 이상 운동하기" },
  { category: "MISSION", text: "운동 끝나고 기록하기" },
  { category: "MISSION", text: "스트레칭 자주 하기" },
  { category: "MINDSET", text: "운동할 땐 다치지 않게" },
  { category: "MINDSET", text: "기록하며 발전하기" }, 
  { category: "MINDSET", text: "운동할 때는 운동에만 집중" },
];

async function seedDefaults() {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  try {
    const goalsRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (goalsRes.ok) {
      const goalsData = await goalsRes.json();
      const existingGoals = goalsData?.data?.goals || [];

      // Vision이 하나만 가능해서 그냥 추가하면 안 됨
      const existingVision = existingGoals.find(
        (g: { category: string }) => g.category === "VISION"
      );

      if (existingVision) {
        await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals/${existingVision.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Deleted existing VISION goal:", existingVision.id);
      }
    }

    const results = [];

    for (const goal of defaultGoals) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(goal),
      });

      if (!res.ok) {
        console.error(`Failed to create goal: ${goal.category}`, await res.text());
        continue;
      }

      const data = await res.json();
      results.push(data);
    }

    return NextResponse.json({
      status: "success",
      code: 200,
      message: "기본 목표 생성 완료",
      data: { created: results.length, goals: results },
    });
  } catch (error) {
    console.error("Error in generating initial goals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST 요청 핸들러
export async function POST() {
  return seedDefaults();
}

// GET 요청 핸들러 (URL 기반 접근용)
export async function GET() {
  return seedDefaults();
}
