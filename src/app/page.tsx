"use client";

import { useQuery } from "@apollo/client/react";
import { GET_BOOKS } from "@/graphql/queries";
import Link from "next/link";
import type { BooksQueryData } from "@/graphql/types";

export default function HomePage() {
  const { data, loading, error } = useQuery<BooksQueryData>(GET_BOOKS);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white">

      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6">Books</h1>

        {loading && <p>Loading books...</p>}
        {error && <p className="text-red-500">{error.message}</p>}

        {!loading && data?.books.length === 0 && (
          <p>No books available.</p>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {data?.books.map((book) => (
            <Link
              key={book.id}
              href={`/book/${book.id}`}
              className="block p-4 bg-white dark:bg-zinc-800 shadow rounded hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-sm mt-1 line-clamp-3">{book.description}</p>
              <p className="text-xs mt-1">Year: {book.publishYear}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}