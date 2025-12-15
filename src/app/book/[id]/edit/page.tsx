"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_BOOK, GET_CATEGORIES, GET_BOOKS } from "@/graphql/queries";
import { UPDATE_BOOK } from "@/graphql/mutations";
import type {
  Book as BookType,
  BookQueryData,
  CategoriesQueryData,
  Category,
} from "@/graphql/types";
import { useParams, useRouter } from "next/navigation";

export default function EditBookPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: bookData, loading: bookLoading } = useQuery<
    BookQueryData,
    { id: string }
  >(GET_BOOK, { variables: { id }, skip: !id });

  const { data: categoriesData } =
    useQuery<CategoriesQueryData>(GET_CATEGORIES);

  const book: BookType | null = bookData?.book ?? null;

  const [form, setForm] = useState({
    title: "",
    description: "",
    publishYear: new Date().getFullYear(),
    categories: [] as string[],
  });

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        description: book.description,
        publishYear: book.publishYear,
        categories: book.categories || [],
      });
    }
  }, [book]);

  const [updateBook, { loading, error }] = useMutation(UPDATE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
  });

  const toggleCategory = (id: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter((c) => c !== id)
        : [...f.categories, id],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    await updateBook({
      variables: {
        id,
        input: {
          title: form.title,
          description: form.description,
          publishYear: Number(form.publishYear),
          categories: form.categories,
        },
      },
    });

    router.push(`/book/${id}`);
  };

  if (bookLoading) {
    return (
      <div className="min-h-screen bg-black text-zinc-400 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-black text-zinc-400 flex items-center justify-center">
        Book not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">
          Edit Book
        </h1>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Title
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="h-32 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Publish year */}
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Publish Year
            </label>
            <input
              type="number"
              value={form.publishYear}
              onChange={(e) =>
                setForm({
                  ...form,
                  publishYear: Number(e.target.value),
                })
              }
              className="w-32 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categoriesData?.categories.map((c: Category) => {
                const active = form.categories.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      active
                        ? "border-zinc-500 bg-zinc-700 text-white"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-zinc-100 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>

            {error && (
              <p className="text-sm text-red-400">
                {error.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}