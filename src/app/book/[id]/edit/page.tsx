"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_BOOK, GET_CATEGORIES, GET_BOOKS } from "@/graphql/queries";
import { UPDATE_BOOK } from "@/graphql/mutations";
import type { Book as BookType, BookQueryData, CategoriesQueryData } from "@/graphql/types";
import { useParams, useRouter } from "next/navigation";

export default function EditBookPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: bookData, loading: bookLoading } = useQuery<BookQueryData, { id: string }>(GET_BOOK, { variables: { id }, skip: !id });
  const { data: categoriesData } = useQuery<CategoriesQueryData>(GET_CATEGORIES);

  const book: BookType | null = bookData?.book ?? null;

  const [form, setForm] = useState({ title: "", description: "", publishYear: new Date().getFullYear(), categories: [] as string[] });

  useEffect(() => {
    if (book) {
      setForm({ title: book.title, description: book.description, publishYear: book.publishYear, categories: book.categories || [] });
    }
  }, [book]);

  const [updateBook, { loading, error }] = useMutation(UPDATE_BOOK, { refetchQueries: [{ query: GET_BOOKS }] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateBook({ variables: { id, input: { title: form.title, description: form.description, publishYear: Number(form.publishYear), categories: form.categories } } });
      router.push(`/book/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCategory = (cId: string) => setForm((f) => ({ ...f, categories: f.categories.includes(cId) ? f.categories.filter((x) => x !== cId) : [...f.categories, cId] }));

  if (bookLoading) return <div>Loading...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Book</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded h-32" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Publish Year</label>
          <input type="number" value={form.publishYear} onChange={(e) => setForm({ ...form, publishYear: Number(e.target.value) })} className="w-32 p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Categories</label>
          <div className="flex gap-2 flex-wrap">
            {categoriesData?.categories.map((c) => (
              <button type="button" key={c.id} onClick={() => toggleCategory(c.id)} className={`px-2 py-1 rounded border ${form.categories.includes(c.id) ? "bg-zinc-800 text-white" : "bg-white"}`}>
                {c.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {error && <p className="text-red-500 mt-2">{String((error as any).message)}</p>}
        </div>
      </form>
    </div>
  );
}
