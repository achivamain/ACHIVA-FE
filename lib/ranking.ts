export type RankingApiResponse<T> = {
  status: string;
  code: number;
  message: string;
  data: T;
};

export type MemberRankingApiItem = {
  nickName: string;
  profileImageUrl: string | null;
  categories: string[];
  articleCount: number;
  weeklyWorkoutCount: number;
  continuousGoalWeeks: number;
};

export type OverallRankingItem = {
  rank: number;
  nickName: string;
  profileImageUrl: string | null;
  articleCount: number;
  weeklyWorkoutCount: number;
  continuousGoalWeeks: number;
  temperature: number;
};

export type MoimRankingApiItem = {
  id: number;
  name: string;
  description: string;
  categories: string[];
  memberCount: number;
  maxMember: number;
  score: number;
  groupGoalCurrent: number;
  groupGoalTarget: number;
  deadlineDaysLeft: number;
  pokeDays: number;
  private: boolean;
  official: boolean;
  isPrivate: boolean;
  isOfficial: boolean;
};

export type CrewRankingItem = {
  rank: number;
  id: number;
  name: string;
  description: string;
  categories: string[];
  memberCount: number;
  maxMember: number;
  score: number;
  isPrivate: boolean;
  isOfficial: boolean;
};

export type CategoryRankingApiMember = {
  memberId: string;
  nickName: string;
  profileImageUrl: string | null;
  articleCount: number;
};

export type CategoryRankingApiGroup = {
  category: string;
  members: CategoryRankingApiMember[];
};

export type CategoryRankingApiData = {
  categories: CategoryRankingApiGroup[];
};

export type CategoryRankingItem = {
  rank: number;
  memberId: string;
  nickName: string;
  profileImageUrl: string | null;
  articleCount: number;
};

export function calculateMemberTemperature(
  articleCount: number,
  continuousGoalWeeks: number,
) {
  return Number(
    (36.5 + articleCount * 0.4 + continuousGoalWeeks * 1.5).toFixed(1),
  );
}

export function calculateCrewTemperature(
  score: number,
) {
  return Number((36.5 + score * 0.8).toFixed(1));
}

export function normalizeOverallRanking(
  items: MemberRankingApiItem[],
): OverallRankingItem[] {
  return [...items]
    .map((item) => ({
      nickName: item.nickName,
      profileImageUrl: item.profileImageUrl,
      articleCount: item.articleCount,
      weeklyWorkoutCount: item.weeklyWorkoutCount,
      continuousGoalWeeks: item.continuousGoalWeeks,
      temperature: calculateMemberTemperature(
        item.articleCount,
        item.continuousGoalWeeks,
      ),
    }))
    .sort((a, b) => {
      if (b.temperature !== a.temperature) {
        return b.temperature - a.temperature;
      }
      if (b.articleCount !== a.articleCount) {
        return b.articleCount - a.articleCount;
      }
      if (b.continuousGoalWeeks !== a.continuousGoalWeeks) {
        return b.continuousGoalWeeks - a.continuousGoalWeeks;
      }
      return a.nickName.localeCompare(b.nickName, "ko");
    })
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
}

export function normalizeCrewRanking(
  items: MoimRankingApiItem[],
): CrewRankingItem[] {
  return [...items]
    .sort((a, b) => {
      const aTemperature = calculateCrewTemperature(a.score);
      const bTemperature = calculateCrewTemperature(b.score);

      if (bTemperature !== aTemperature) {
        return bTemperature - aTemperature;
      }
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.memberCount !== a.memberCount) {
        return b.memberCount - a.memberCount;
      }
      return a.name.localeCompare(b.name, "ko");
    })
    .map((item, index) => ({
      rank: index + 1,
      id: item.id,
      name: item.name,
      description: item.description,
      categories: item.categories,
      memberCount: item.memberCount,
      maxMember: item.maxMember,
      score: item.score,
      isPrivate: item.isPrivate ?? item.private,
      isOfficial: item.isOfficial ?? item.official,
    }));
}

export function normalizeCategoryRanking(
  members: CategoryRankingApiMember[],
): CategoryRankingItem[] {
  return [...members]
    .sort((a, b) => {
      if (b.articleCount !== a.articleCount) {
        return b.articleCount - a.articleCount;
      }
      return a.nickName.localeCompare(b.nickName, "ko");
    })
    .map((member, index) => ({
      rank: index + 1,
      memberId: member.memberId,
      nickName: member.nickName,
      profileImageUrl: member.profileImageUrl,
      articleCount: member.articleCount,
    }));
}
