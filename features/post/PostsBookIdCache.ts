"use client";
//게시글이 어떤 책에 속해있는지 저장합니다
//상세 페이지에서 책 제목이 뜨지 않는 오류 임시 해결용
class PostsBookIdCache {
  private cache = new Map<string, {bookId:string, bookTitle: string}>();

  set(key: string, value: {bookId:string, bookTitle: string}) {
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }
}
export const postsBookIdCache = new PostsBookIdCache;