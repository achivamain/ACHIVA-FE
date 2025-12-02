import type { Category } from "./Categories";
import type { BookCoverImage } from "./BookCoverImages";
import { PostRes } from "./Post";

export type Book = {
  id: string;
  title: string;
  category: Category | undefined;
  count: number;
  coverColor: string;
  coverImage: BookCoverImage;
  articles?: PostRes[];
};
export type BookRes = {
  id: string;
  title: string;
  description: string;
  mainArticle: PostRes;
  articles: PostRes[];
};
