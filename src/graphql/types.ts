// src/graphql/types.ts
export interface Book {
  id: string;
  title: string;
  description: string;
  publishYear: number;
  authorId: string;
  categories: string[];
}

export interface BooksQueryData {
  books: Book[];
}

export interface BookQueryData {
  book: Book | null;
}

export interface User {
  id: string;
  username: string;
  bio: string;
  birthDate: string;
  nationality: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface ReviewsByBookQueryData {
  reviewsByBook: Review[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  parentCategoryId?: string | null;
}

export interface CategoriesQueryData {
  categories: Category[];
}

export interface UsersQueryData {
  users: User[];
}