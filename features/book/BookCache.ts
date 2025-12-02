"use client";

import { Book } from "@/types/Book";

//책에 어떤 게시글이 들어있는지 게시글 ID들을 저장합니다.
//게시글이 책의 몇 번째 이야기인지 띄우는 용도
class BookCache {
  private cache = new Map<string, Book>();

  set(key: string, value: Book) {
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }
}
export const useBookCache = new BookCache;