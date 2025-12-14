"use client";

import Link from "next/link";
import { useStore } from "@/stores/useStore";

export function Header() {
  const { user, logout } = useStore();

  return (
    <header className="flex justify-between items-center p-4 bg-zinc-100 dark:bg-zinc-900 shadow-md">
      <nav className="flex gap-4">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/create-category" className="hover:underline">Create Category</Link>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-zinc-700 dark:text-zinc-200">{user.username}</span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600">Login</Link>
        )}
      </div>
    </header>
  );
}