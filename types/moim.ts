import { Category } from "./Categories";

export type Moim = {
  id: number;
  name: string;
  description: string;
  categories: Category[];
  leaderName: string;
  memberCount: number;
  maxMember: number;
  isPrivate: boolean;
  isOfficial: boolean;
};