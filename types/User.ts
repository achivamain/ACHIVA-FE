// 회원가입 시에만 쓰이는...
export type SignupUser = {
  nickName: string;
  profileImg: string | null;
  birth?: Date;
  categories: string[];
};

// 서버에서 응답으로 받는 유저 정보
export type User = {
  id: string;
  email: string;
  nickName: string;
  birth: string;
  gender: string;
  region: string;
  categories: string[];
  profileImageUrl: string;
  role?: string;
  description: string;
  createdAt: string;
};
