// 회원가입 시에만 쓰이는...
export type SignupUser = {
  nickName: string;
  profileImg?: string;
  birth?: Date;
  gender?: string;
  organizationId?: number;
  organizationPassword?: string;
};

export type UserGender = "MALE" | "FEMALE";

// 서버에서 응답으로 받는 유저 정보
export type User = {
  id: string;
  email: string;
  nickName: string;
  birth: string;
  gender: UserGender;
  region: string;
  profileImageUrl: string;
  role: string;
  description: string;
  articleCount: number;
  organizationId: number;
  organizationName: string;
  createdAt: string;
};

export type UserDetail = User & {
  weeklyWorkoutCount: number;
  continuousGoalWeeks: number;
  totalCharacterCountFrom2025: number;
  totalSendingCheeringScore: number;
  totalReceivingCheeringScore: number;
};
