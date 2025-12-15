"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { REGISTER_USER } from "@/graphql/mutations";
import { useStore } from "@/stores/useStore";

interface User {
  id: string;
  username: string;
  bio: string;
  birthDate: string;
  nationality: string;
}

interface RegisterResponse {
  registerUser: {
    user: User;
    token: string;
  };
}

interface RegisterVariables {
  input: {
    username: string;
    password: string;
    bio: string;
    birthDate: string;
    nationality: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [form, setForm] = useState<RegisterVariables["input"]>({
    username: "",
    password: "",
    bio: "",
    birthDate: "",
    nationality: "",
  });

  const [registerUser, { loading, error }] = useMutation<RegisterResponse, RegisterVariables>(REGISTER_USER);

  const handleRegister = async () => {
    try {
      const response = await registerUser({ variables: { input: form } });
      const data = response.data;
      if (!data) return;
      const { user, token } = data.registerUser;
      setUser(user, token);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-12 shadow-lg dark:bg-zinc-900 w-full max-w-md">
      <h1 className="text-2xl font-semibold text-center text-black dark:text-white">Register</h1>
      <input
        className="rounded border border-zinc-300 p-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        className="rounded border border-zinc-300 p-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <input
        className="rounded border border-zinc-300 p-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        placeholder="Bio"
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
      />
      <input
        type="date"
        className="rounded border border-zinc-300 p-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        placeholder="Birth Date"
        value={form.birthDate}
        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
      />
      <input
        className="rounded border border-zinc-300 p-3 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        placeholder="Nationality"
        value={form.nationality}
        onChange={(e) => setForm({ ...form, nationality: e.target.value })}
      />
      <button
        className="rounded bg-black text-white py-3 font-medium hover:bg-zinc-800 disabled:opacity-50"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
      <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
        Already have an account? <a href="/login" className="font-medium underline">Login</a>
      </p>
    </div>
  );
}