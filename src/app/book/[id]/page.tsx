"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useStore } from "@/stores/useStore";
import { useParams, useRouter } from "next/navigation";
import {
  GET_BOOK,
  GET_REVIEWS_BY_BOOK,
  GET_USER,
  GET_CATEGORIES,
  GET_USERS,
  GET_BOOKS,
} from "@/graphql/queries";
import Link from "next/link";
import { DELETE_BOOK, CREATE_REVIEW, DELETE_REVIEW } from "@/graphql/mutations";
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

  const { data: reviewsData, loading: reviewsLoading } = useQuery<ReviewsByBookQueryData, { bookId: string }>(
    GET_REVIEWS_BY_BOOK,
    { variables: { bookId: id }, skip: !id }
  );

  const { data: categoriesData } = useQuery<CategoriesQueryData>(GET_CATEGORIES);
  const { data: usersData } = useQuery<UsersQueryData>(GET_USERS);

  const currentUser = useStore((s) => s.user);

  const authorId = bookData?.book?.authorId;
  const { data: authorData } = useQuery<{ user: UserType | null }, { id: string }>(GET_USER, {
    variables: { id: authorId as string },
    skip: !authorId,
  });

  if (bookLoading) return <PageState text="Loading book…" />;
  if (bookError) return <PageState text="Error loading book" error />;
  if (!bookData?.book) return <PageState text="Book not found" />;

  const book = bookData.book;
  const reviews = reviewsData?.reviewsByBook || [];

  const hasReviewed = currentUser ? reviews.some((r) => r.userId === currentUser.id) : false;

  const categoryMap = new Map<string, Category>();
  categoriesData?.categories.forEach((c) => categoryMap.set(c.id, c));

  const userMap = new Map<string, UserType>();
  usersData?.users.forEach((u) => userMap.set(u.id, u));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Book card */}
      <section className="rounded-2xl bg-zinc-900/80 shadow-lg border border-zinc-800 p-6 mb-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">{book.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span>Published {book.publishYear}</span>
            {authorData?.user && <span>by {authorData.user.username}</span>}
          </div>

          <p className="mt-4 leading-relaxed text-zinc-300 whitespace-pre-line">{book.description}</p>

          {book.categories.map((cId) => {
            const category = categoryMap.get(cId);
            if (!category) return null;

            return (
              <span
                key={cId}
                className="inline-flex items-center gap-2 w-fit rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
              >
                <span className="leading-none">{category.icon}</span>
                <span className="whitespace-nowrap">{category.title}</span>
              </span>
            );
        })}

          <AuthorControls book={book} />
        </div>
      </section>

      {/* Reviews */}
      <section className="space-y-6 text-zinc-100">
        <h2 className="text-2xl font-semibold">Reviews</h2>

        {reviewsLoading && <PageState text="Loading reviews…" />}
        {!reviewsLoading && reviews.length === 0 && (
          <p className="text-sm text-zinc-400">No reviews yet.</p>
        )}

        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-zinc-100">⭐ {r.rating} / 5</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(r.createdAt).toLocaleDateString()} · {userMap.get(r.userId)?.username}
                  </p>
                </div>

                {currentUser?.id === r.userId && (
                  <ReviewDeleteButton reviewId={r.id} bookId={book.id} />
                )}
              </div>

              {r.comment && <p className="mt-3 text-sm text-zinc-300">{r.comment}</p>}
            </li>
          ))}
        </ul>

        <div className="pt-6 border-t border-zinc-800">
          {currentUser ? (
            currentUser.id === book.authorId ? (
              <InfoText text="Authors cannot review their own books." />
            ) : hasReviewed ? (
              <InfoText text="You have already reviewed this book." />
            ) : (
              <ReviewForm bookId={book.id} />
            )
          ) : (
            <InfoText text="Please log in to write a review." />
          )}
        </div>
      </section>
    </div>
  );
}

function PageState({ text, error }: { text: string; error?: boolean }) {
  return (
    <div className={`text-center py-12 text-sm ${error ? "text-red-500" : "text-zinc-500"}`}>
      {text}
    </div>
  );
}

function InfoText({ text }: { text: string }) {
  return <p className="text-sm text-zinc-400">{text}</p>;
}

function AuthorControls({ book }: { book: BookType }) {
  const currentUser = useStore((s) => s.user);
  if (!currentUser || currentUser.id !== book.authorId) return null;

  return (
    <div className="mt-6 flex gap-3">
      <Link
        href={`/book/${book.id}/edit`}
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
      >
        Edit
      </Link>
      <DeleteButton bookId={book.id} />
    </div>
  );
}

function DeleteButton({ bookId }: { bookId: string }) {
  const [deleteBook, { loading }] = useMutation(DELETE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
  });
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this book?")) return;
    await deleteBook({ variables: { id: bookId } });
    router.push("/");
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg bg-red-900/20 px-4 py-2 text-sm text-red-400 hover:bg-red-900/40"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}

function ReviewForm({ bookId }: { bookId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [createReview, { loading, error }] = useMutation(CREATE_REVIEW, {
    refetchQueries: [{ query: GET_REVIEWS_BY_BOOK, variables: { bookId } }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReview({
      variables: { input: { bookId, rating, comment: comment || null } },
    });
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-600">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
        >
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-zinc-600">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-sm text-zinc-200"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-900 hover:bg-white"
      >
        {loading ? "Submitting…" : "Submit review"}
      </button>

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </form>
  );
}

function ReviewDeleteButton({ reviewId, bookId }: { reviewId: string; bookId: string }) {
  const [deleteReview, { loading }] = useMutation(DELETE_REVIEW, {
    refetchQueries: [{ query: GET_REVIEWS_BY_BOOK, variables: { bookId } }],
  });

  const handleDelete = async () => {
    if (!confirm("Delete this review?")) return;
    await deleteReview({ variables: { id: reviewId } });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-300 hover:underline"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
