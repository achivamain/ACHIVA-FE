import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  type CategoryRankingApiData,
  type MemberRankingApiItem,
  type MoimRankingApiItem,
  type RankingApiResponse,
  normalizeCategoryRanking,
  normalizeCrewRanking,
  normalizeOverallRanking,
} from "@/lib/ranking";

class RankingApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function fetchRankingData<T>(token: string, path: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    console.error(`Ranking backend error: GET ${path}`, res.status, errorText);
    throw new RankingApiError("랭킹 조회 실패", res.status);
  }

  const json = (await res.json()) as RankingApiResponse<T>;
  return json.data;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const token = session?.access_token;

  if (!token) {
    return NextResponse.json({ error: "미인증 유저" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");

  try {
    if (type === "crew") {
      const data = await fetchRankingData<MoimRankingApiItem[]>(
        token,
        "/api/moim/ranking",
      );

      return NextResponse.json({
        data: normalizeCrewRanking(data),
      });
    }

    if (category) {
      const data = await fetchRankingData<CategoryRankingApiData>(
        token,
        "/api/category/ranking",
      );
      const matchedCategory = data.categories.find(
        (item) => item.category === category,
      );

      return NextResponse.json({
        data: normalizeCategoryRanking(matchedCategory?.members ?? []),
      });
    }

    const data = await fetchRankingData<MemberRankingApiItem[]>(
      token,
      "/api/members/ranking",
    );

    return NextResponse.json({
      data: normalizeOverallRanking(data),
    });
  } catch (error) {
    if (error instanceof RankingApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Error in fetching ranking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
