"use client";

import Link from "next/link";
import { useStore } from "@/stores/useStore";
import { useEffect, useState } from "react";

export function Header() {
  const { user, logout } = useStore();
  const [unread, setUnread] = useState<number>(0);
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id) return;
    const ws = new WebSocket(`ws://localhost:4001?userId=${user.id}`);

    ws.onmessage = (event) => {
      let parsed: any = null;
      try {
        parsed = JSON.parse(event.data);
        console.log("🔔 Notification:", parsed);
      } catch (err) {
        parsed = { raw: event.data };
        console.log("🔔 Notification (raw):", event.data);
      }

      const notif = {
        id: `${Date.now()}-${Math.random()}`,
        payload: parsed,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [notif, ...prev]);
      setUnread((u) => u + 1);
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);

    return () => {
      try {
        ws.close();
      } catch (e) {
        /* ignore */
      }
    };
  }, [user?.id]);

  return (
    <>
    <header className="flex justify-between items-center p-4 bg-zinc-100 dark:bg-zinc-900 shadow-md">
      <nav className="flex gap-4">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/create-category" className="hover:underline">Create Category</Link>
        <Link href="/create-book" className="hover:underline">Publish Book</Link>
      </nav>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button
              onClick={() => {
                setModalOpen(true);
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                setUnread(0);
              }}
              title="Notifications"
              className="relative p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-700 dark:text-zinc-200" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a4 4 0 00-4 4v2.586l-.707.707A1 1 0 005 11h10a1 1 0 00.707-1.707L14 8.586V6a4 4 0 00-4-4z" />
                <path d="M8.5 15a1.5 1.5 0 003 0h-3z" />
              </svg>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unread}</span>
              )}
            </button>
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

    { modalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
        <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded shadow-lg p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                  setUnread(0);
                }}
                className="text-sm px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800"
              >
                Mark all read
              </button>
              <button onClick={() => setModalOpen(false)} className="text-sm px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800">Close</button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-zinc-600">No notifications</p>
            ) : (
              notifications.map((n: any) => (
                <div key={n.id} className={`p-3 rounded border ${n.read ? "bg-zinc-50 dark:bg-zinc-800" : "bg-white dark:bg-zinc-700"}`}>
                  <div className="text-xs text-zinc-500 mb-1">{new Date(n.createdAt).toLocaleString()}</div>
                  <pre className="text-sm whitespace-pre-wrap break-words">{typeof n.payload === "string" ? n.payload : JSON.stringify(n.payload, null, 2)}</pre>
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