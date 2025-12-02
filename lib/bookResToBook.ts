import { BookRes, Book } from "@/types/Book";
import { BookCoverImage, bookCoverImages } from "@/types/BookCoverImages";
import { Category, categories } from "@/types/Categories";

export function bookResToBook(bookRes: BookRes): Book {
  const category: Category = categories.find(
    (i) => i == bookRes.mainArticle.category
  )!;

  const coverColor: string = bookRes.mainArticle.backgroundColor;
  const coverImage: BookCoverImage = bookCoverImages.find((i) => i == bookRes.mainArticle.photoUrl) || "default"; //없는 이미지 방지

  return {
    id: bookRes.id,
    title: bookRes.mainArticle.title,
    category: category,
    coverColor: coverColor,
    coverImage: coverImage,
    count: bookRes.articles.length,
    articles: bookRes.articles,
  };
}
