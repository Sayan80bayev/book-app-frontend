import { create } from "zustand";

interface User {
  id: string;
  username: string;
  bio: string;
  birthDate: string;
  nationality: string;
}

interface Store {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useStore = create<Store>((set) => ({
  // Do NOT read localStorage during module init — keep initial state identical on server and client
  user: null,
  token: null,
  setUser: (user, token) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth", JSON.stringify({ user, token }));
      }
    } catch (err) {
      console.error("Failed to save auth to localStorage:", err);
    }
    set({ user, token });
  },
  logout: () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth");
      }
    } catch (err) {
      console.error("Failed to remove auth from localStorage:", err);
    }
    set({ user: null, token: null });
  },
  // call this from a client-only component (e.g. layout) inside useEffect
  initializeAuth: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("auth");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.token) {
        set({ user: parsed.user, token: parsed.token });
      }
    } catch (err) {
      console.error("Failed to initialize auth from localStorage:", err);
    }
  },
}));