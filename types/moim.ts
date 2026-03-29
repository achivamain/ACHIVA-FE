import { Category } from "./Categories";

export type MoimMemberRole = "LEADER";

export type MoimMember = {
  id: string;
  name: string;
  monthlyPosts: number;
  weeklyStreak: number;
  lastActiveDaysAgo: number;
  role: MoimMemberRole;
  me?: boolean;
  isMe?: boolean;
  profileImageUrl?: string;
};

// Swagger 문서 기준, 기능 개발 중이라 실제로 들어오는 값은 달라서 추후 수정 필요 
export type Moim = {
  id: number;
  name: string;
  description: string;
  score: number;
  categories: Category[];
  leaderName: string;
  memberCount: number;
  maxMember: number;
  groupGoalCurrent: number;
  groupGoalTarget: number;
  deadlineDaysLeft: number;
  pokeDays: number;
  members: MoimMember[];
  private: boolean;
  official: boolean;
  isPrivate: boolean;
  isOfficial: boolean;
};
