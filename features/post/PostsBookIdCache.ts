"use client";
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