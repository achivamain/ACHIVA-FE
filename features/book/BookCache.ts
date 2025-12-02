"use client";
import { Book } from "@/types/Book";

//책에 어떤 게시글이 들어있는지 게시글 ID들을 저장합니다.
//게시글이 책의 몇 번째 이야기인지 띄우는 용도
class BookCache {
  private cache = new Map<string, Book>();
  private async getBookData(bookId: string) {
    const res = await fetch(`/api/books?bookId=${bookId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok)  return undefined;

    const book = await res.json();
    return book;
  }

  async set(key: string) {
    await this.getBookData(key).then((value) => {
      if (value) this.cache.set(key, value);
    });
  }

  get(key: string) {
    return this.cache.get(key);
  }

  async getIndex(bookId: string, articleId: string) {
    try {
      let book = this.get(bookId);
      let index = book?.articles?.map((post) => post.id).indexOf(articleId);
      if (book && index !== undefined) {
        return index + 1;
      }

      //책이 아직 저장되지 않음 or 저장된 책 데이터가 outdated -> 새로 업데이트 후 재시도
      await this.set(bookId);
      book = this.get(bookId);
      index = book!.articles?.map((post) => post.id).indexOf(articleId);
      return index! + 1;
    } catch (error){
        console.log(error)
      return undefined;
    }
  }
}
export const bookCache = new BookCache();
