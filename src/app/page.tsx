"use client";

import { useQuery } from "@apollo/client/react";
import { GET_BOOKS } from "@/graphql/queries";
import Link from "next/link";
import type { BooksQueryData } from "@/graphql/types";

export default function HomePage() {
  const { data, loading, error } = useQuery<BooksQueryData>(GET_BOOKS);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">Books</h1>

        {loading && (
          <p className="text-sm text-zinc-400">Loading books…</p>
        )}

        {error && (
          <p className="text-sm text-red-400">{error.message}</p>
        )}

        {!loading && data?.books.length === 0 && (
          <p className="text-sm text-zinc-400">No books available.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data?.books.map((book) => (
            <Link
              key={book.id}
              href={`/book/${book.id}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:bg-zinc-800"
            >
              <h2 className="mb-1 text-lg font-medium text-zinc-100 group-hover:text-white">
                {book.title}
              </h2>

              <p className="text-sm text-zinc-400 line-clamp-3">
                {book.description}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Published {book.publishYear}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}