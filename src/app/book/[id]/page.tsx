"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { GET_BOOK, GET_REVIEWS_BY_BOOK, GET_USER, GET_CATEGORIES, GET_USERS } from "@/graphql/queries";
import type {
  Book as BookType,
  BookQueryData,
  ReviewsByBookQueryData,
  Review as ReviewType,
  User as UserType,
  CategoriesQueryData,
  Category,
  UsersQueryData,
} from "@/graphql/types";

export default function BookPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: bookData, loading: bookLoading, error: bookError } = useQuery<BookQueryData, { id: string }>(GET_BOOK, {
    variables: { id },
    skip: !id,
  });
  
  const { data: reviewsData, loading: reviewsLoading } = useQuery<ReviewsByBookQueryData, { bookId: string }>(GET_REVIEWS_BY_BOOK, {
    variables: { bookId: id },
    skip: !id,
  });

  const { data: categoriesData } = useQuery<CategoriesQueryData>(GET_CATEGORIES);
  const { data: usersData } = useQuery<UsersQueryData>(GET_USERS);

  const authorId = bookData?.book?.authorId;
  const { data: authorData } = useQuery<{ user: UserType | null }, { id: string }>(GET_USER, {
    variables: { id: authorId as string },
    skip: !authorId,
  });
  
  if (bookLoading) return <div>Loading book...</div>;
  if (bookError) return <div>Error loading book: {String(bookError.message)}</div>;
  if (!bookData?.book) return <div>Book not found</div>;

  const book: BookType = bookData!.book as BookType;
  const reviews: ReviewType[] = reviewsData?.reviewsByBook || [];

  const categoryMap = new Map<string, Category>();
  categoriesData?.categories.forEach((c) => categoryMap.set(c.id, c));

  const userMap = new Map<string, UserType>();
  usersData?.users.forEach((u) => userMap.set(u.id, u));

  return (
    <div className="mx-auto max-w-4xl p-6">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
        <p className="text-sm text-zinc-600 mb-4">Published: {book.publishYear}</p>
        {authorData?.user && (
          <p className="text-sm text-zinc-700 mb-4">By: {authorData.user.username}</p>
        )}
        <p className="whitespace-pre-line">{book.description}</p>
        {book.categories?.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {book.categories.map((cId: string) => (
              <span key={cId} className="text-xs px-2 py-1 bg-zinc-100 rounded">{categoryMap.get(cId)?.title ?? cId}</span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {reviewsLoading && <div>Loading reviews...</div>}
        {reviews.length === 0 && !reviewsLoading && <p>No reviews yet.</p>}
        <ul className="space-y-4">
          {reviews.map((r: ReviewType) => (
            <li key={r.id} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <strong>Rating: {r.rating}/5</strong>
                <span className="text-sm text-zinc-500">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              {r.comment && <p className="mb-2">{r.comment}</p>}
              <p className="text-xs text-zinc-600">User: {userMap.get(r.userId)?.username ?? r.userId}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
