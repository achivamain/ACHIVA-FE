import type { PostRes } from "./Post";
import type { CheeringCategory } from "@/lib/cheering";

export type PostsData = {
  totalElements: number;
  totalPages: number;
  size: number;
  content: PostRes[];
  number: number;
  sort: Sort;
  numberOfElements: number;
  pageable: Pageable;
  first: boolean;
  last: boolean;
  empty: boolean;
};

interface Sort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

interface Pageable {
  offset: number;
  sort: Sort;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

export type Cheering = {
  id: number;
  content: string;
  cheeringCategory: CheeringCategory;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  articleId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CheerPoint = {
  cheeringCategory: CheeringCategory;
  count: number;
  points: number;
};

export type NotificationsRes = {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Notification[];
  number: number;
  sort: Sort;
  numberOfElements: number;
  pageable: Pageable;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type Notification = {
  id: number;
  content: string;
  cheeringCategory: CheeringCategory;
  senderId: string;
  senderName: string;
  senderProfileImageUrl: string;
  receiverId: string;
  receiverName: string;
  articleId: string;
  isRead: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};
