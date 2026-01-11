
export type GoalCategory = "VISION" | "MISSION" | "MINDSET";

// 백엔드 API 응답 형식
export type Goal = {
  id: string;
  category: GoalCategory;
  text: string;
  clickCount: number;
  isArchived: boolean;
  memberId: string;
  createdAt: string;
  updatedAt: string;
};

// API 응답 래퍼
export type GoalsResponse = {
  status: string;
  code: number;
  message: string;
  data: {
    goals: Goal[];
    total: number;
  };
};

export type GoalResponse = {
  status: string;
  code: number;
  message: string;
  data: Goal;
};

// 목표 생성 요청 시 형식
export type CreateGoalRequest = {
  category: GoalCategory;
  text: string;
};

// 목표 수정 요청 시 형식 
export type UpdateGoalRequest = {
  category: GoalCategory;
  text: string;
};

// 목표에 편집이 가해진 상태 처리
export type EditableGoal = {
  id: string;
  text: string;
  isNew?: boolean; // 추가되는 목표인지 
  originalText?: string; // 변경 감지용 원본 텍스트
};

export type EditModalData = {
  vision: EditableGoal | null; // vision은 하나만
  missions: EditableGoal[];
  mindsets: EditableGoal[];
};

// 저장 버튼 누를 때 대기되는 액션
export type PendingAction = {
  type: "archive" | "delete";
  id: string;
};
