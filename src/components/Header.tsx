"use client";

import Link from "next/link";
import { useStore } from "@/stores/useStore";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: "REVIEW_CREATED";
  createdAt: string;
  read: boolean;
};

export function Header() {
  const { user, logout } = useStore();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const ws = new WebSocket(`ws://localhost:4001?userId=${user.id}`);

    ws.onmessage = () => {
      setNotifications((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: "REVIEW_CREATED",
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);

      setUnread((u) => u + 1);
    };

    return () => ws.close();
  }, [user?.id]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Left */}
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-zinc-200 hover:text-white">
              Home
            </Link>
            <Link
              href="/create-category"
              className="text-zinc-400 hover:text-white"
            >
              Create Category
            </Link>
            <Link
              href="/create-book"
              className="text-zinc-400 hover:text-white"
            >
              Publish Book
            </Link>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => {
                    setModalOpen(true);
                    setNotifications((n) =>
                      n.map((x) => ({ ...x, read: true }))
                    );
                    setUnread(0);
                  }}
                  className="relative rounded-lg p-2 hover:bg-zinc-800"
                >
                  <svg
                    className="h-5 w-5 text-zinc-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 2a4 4 0 00-4 4v2.586l-.707.707A1 1 0 005 11h10a1 1 0 00.707-1.707L14 8.586V6a4 4 0 00-4-4z" />
                    <path d="M8.5 15a1.5 1.5 0 003 0h-3z" />
                  </svg>

                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-red-600 px-1.5 text-xs text-white">
                      {unread}
                    </span>
                  )}
                </button>

                <span className="text-sm text-zinc-300">
                  {user.username}
                </span>

                <button
                  onClick={logout}
                  className="rounded-lg bg-red-900/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-900 hover:bg-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Notifications modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">
                Notifications
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNotifications((n) =>
                      n.map((x) => ({ ...x, read: true }))
                    );
                    setUnread(0);
                  }}
                  className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  Mark all read
                </button>

                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg border border-zinc-800 p-3 ${
                      n.read ? "bg-zinc-800/60" : "bg-zinc-800"
                    }`}
                  >
                    <div className="mb-1 text-xs text-zinc-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>

                    <p className="text-sm text-zinc-200">
                      You have got a new review!
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}