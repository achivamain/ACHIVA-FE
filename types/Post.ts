import type { Category } from "./Categories";
import type { Cheering } from "./responses";
import type { Book } from "./Book";

export type Post = {
  titleImageUrl: string;
  title: string;
  category: Category;
  backgroundColor: BackgroundColor;
  pages: PostPage[];
};

export type DraftPost = Partial<Post> & {
  id?: string;
  categoryCount?: number;
  book?: Book;
}; // 글쓰기 중 타입

export type PostPage = {
  id: string;
  subtitle?: string;
  content: string;
};

export type CategoryCount = {
  category: Category;
  count: number;
};

export type BackgroundColor =
  | "#f9f9f9"
  | "#000000"
  | "#412A2A"
  | "#A6736F"
  | "#4B5373"
  | "#525D49";

// 백엔드에서 응답으로 받는 형태
export type PostRes = {
  id: number;
  photoUrl: string;
  title: string;
  category: string;
  question: Question[];
  memberId: string;
  memberNickName: string;
  memberProfileUrl: string;
  backgroundColor: BackgroundColor;
  authorCategorySeq: number;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
  cheerings?: Cheering[];
};

export type Question = {
  question: string;
  content: string;
};
