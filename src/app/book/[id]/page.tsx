"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useStore } from "@/stores/useStore";
import { useParams, useRouter } from "next/navigation";
import { GET_BOOK, GET_REVIEWS_BY_BOOK, GET_USER, GET_CATEGORIES, GET_USERS, GET_BOOKS } from "@/graphql/queries";
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
  
  const { data: reviewsData, loading: reviewsLoading } = useQuery<ReviewsByBookQueryData, { bookId: string }>(GET_REVIEWS_BY_BOOK, {
    variables: { bookId: id },
    skip: !id,
  });

  const { data: categoriesData } = useQuery<CategoriesQueryData>(GET_CATEGORIES);
  const { data: usersData } = useQuery<UsersQueryData>(GET_USERS);

  const currentUser = useStore((s) => s.user);

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

  const hasReviewed = currentUser ? reviews.some((r) => r.userId === currentUser.id) : false;

  const categoryMap = new Map<string, Category>();
  categoriesData?.categories.forEach((c: Category) => categoryMap.set(c.id, c));

  const userMap = new Map<string, UserType>();
  usersData?.users.forEach((u: UserType) => userMap.set(u.id, u));

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
              <span key={cId} className="text-xs px-2 py-1 bg-zinc-800 text-white rounded">{categoryMap.get(cId)?.title ?? cId}</span>
            ))}
          </div>
        )}

        <AuthorControls book={book} />
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
              {currentUser && currentUser.id === r.userId && (
                <div className="mt-2">
                  <ReviewDeleteButton reviewId={r.id} bookId={book.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
        
        {/* Review form */}
        <div className="mt-6">
          {currentUser ? (
            currentUser.id === book.authorId ? (
              <p className="text-sm text-zinc-600">Authors cannot review their own books.</p>
            ) : hasReviewed ? (
              <p className="text-sm text-zinc-600">You have already reviewed this book.</p>
            ) : (
              <ReviewForm bookId={book.id} />
            )
          ) : (
            <p className="text-sm text-zinc-600">Please log in to write a review.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function DeleteButton({ bookId }: { bookId: string }) {
  const [deleteBook, { loading }] = useMutation(DELETE_BOOK, { refetchQueries: [{ query: GET_BOOKS }], onError: (e: any) => console.error(e) });
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this book?")) return;
    try {
      await deleteBook({ variables: { id: bookId } });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4">
      <button onClick={handleDelete} disabled={loading} className="px-3 py-1 rounded bg-red-600 text-white">
        {loading ? "Deleting..." : "Delete Book"}
      </button>
    </div>
  );
}

function AuthorControls({ book }: { book: BookType }) {
  const currentUser = useStore((s) => s.user);
  if (!currentUser) return null;
  if (currentUser.id !== book.authorId) return null;
  return (
    <div className="flex gap-2 mt-4">
      <Link href={`/book/${book.id}/edit`} className="px-3 py-1 rounded bg-blue-600 text-white">Edit</Link>
      <DeleteButton bookId={book.id} />
    </div>
  );
}

function ReviewForm({ bookId }: { bookId: string }) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [createReview, { loading, error }] = useMutation(CREATE_REVIEW, { refetchQueries: [{ query: GET_REVIEWS_BY_BOOK, variables: { bookId } }] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReview({ variables: { input: { bookId, rating: Number(rating), comment: comment || null } } });
      setComment("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm">Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="p-1 border rounded">
          <option value={5}>5</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>
      </div>
      <div>
        <label className="text-sm block mb-1">Comment (optional)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-2 border rounded h-24" />
      </div>
      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
          {loading ? "Submitting..." : "Submit Review"}
        </button>
        {error && <p className="text-red-500 mt-2">{String((error as any).message)}</p>}
      </div>
    </form>
  );
}

function ReviewDeleteButton({ reviewId, bookId }: { reviewId: string; bookId: string }) {
  const [deleteReview, { loading }] = useMutation(DELETE_REVIEW, {
    refetchQueries: [{ query: GET_REVIEWS_BY_BOOK, variables: { bookId } }],
    onError: (e: any) => console.error(e),
  });

  const handleDelete = async () => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview({ variables: { id: reviewId } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="px-2 py-1 text-sm bg-red-600 text-white rounded">
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
