"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_BOOK } from "@/graphql/mutations";
import { GET_CATEGORIES, GET_BOOKS } from "@/graphql/queries";
import type { CategoriesQueryData, Category } from "@/graphql/types";
import { useRouter } from "next/navigation";

export default function CreateBookPage() {
  const router = useRouter();
  const { data: categoriesData } = useQuery<CategoriesQueryData>(GET_CATEGORIES);
  const [form, setForm] = useState({ title: "", description: "", publishYear: new Date().getFullYear(), categories: [] as string[] });

  const [createBook, { loading, error }] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: GET_BOOKS }],
  });

  const toggleCategory = (id: string) => {
    setForm((f) => ({ ...f, categories: f.categories.includes(id) ? f.categories.filter((c) => c !== id) : [...f.categories, id] }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBook({ variables: { input: { title: form.title, description: form.description, publishYear: Number(form.publishYear), categories: form.categories } } });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Publish a Book</h1>
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
            {categoriesData?.categories.map((c: Category) => (
              <button type="button" key={c.id} onClick={() => toggleCategory(c.id)} className={`px-2 py-1 rounded border ${form.categories.includes(c.id) ? "bg-zinc-800 text-white" : "bg-white"}`}>
                {c.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
            {loading ? "Publishing..." : "Publish Book"}
          </button>
          {error && <p className="text-red-500 mt-2">{String(error.message)}</p>}
        </div>
      </form>
    </div>
  );
}
