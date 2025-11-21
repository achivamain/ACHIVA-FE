export type GoalItem = {
  id: number;
  text: string;
  count: number;
  isArchived: boolean;
};

export type Mission = GoalItem;
export type Mindset = GoalItem;
export type Vision = GoalItem;

export type ModalData = {
  vision: GoalItem;
  missions: GoalItem[];
  mindsets: GoalItem[];
};
