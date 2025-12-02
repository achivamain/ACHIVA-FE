"use client";

//게시글이 어떤 책에 속해있는지, 몇 번째  저장합니다
//상세 페이지에서 책 제목이 뜨지 않는 오류, n번째 이야기가 잘못 뜨는 오류 대응
//(임시)
class PostsBookIdCache {
  private cache = new Map<string, { bookId: string; bookTitle: string }>();

  async set(key: string, value: { bookId: string; bookTitle: string }) {
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }
}
export const postsBookIdCache = new PostsBookIdCache();
