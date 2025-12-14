"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_CATEGORY } from "@/graphql/mutations";
import { Header } from "@/components/Header";

export default function CreateCategoryPage() {
  const [form, setForm] = useState({ title: "", description: "", icon: "", parentCategoryId: "" });
  const [createCategory, { loading, error }] = useMutation(CREATE_CATEGORY);

  const handleCreate = async () => {
    try {
      const variables = { input: { ...form, parentCategoryId: form.parentCategoryId || null } };
      await createCategory({ variables });
      alert("Category created!");
      setForm({ title: "", description: "", icon: "", parentCategoryId: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white">
      <main className="p-8 max-w-md mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4">Create Category</h1>

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="p-3 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="p-3 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <input
          placeholder="Icon URL"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="p-3 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <input
          placeholder="Parent Category ID (optional)"
          value={form.parentCategoryId}
          onChange={(e) => setForm({ ...form, parentCategoryId: e.target.value })}
          className="p-3 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="py-3 bg-black text-white rounded hover:bg-zinc-800"
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
        {error && <p className="text-red-500 text-sm">{error.message}</p>}
      </main>
    </div>
  );
}