"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { LOGIN_USER } from "@/graphql/mutations";
import { useStore } from "@/stores/useStore";

interface User {
  id: string;
  username: string;
  bio: string;
  birthDate: string;
  nationality: string;
}

interface LoginResponse {
  loginUser: {
    user: User;
    token: string;
  };
}

interface LoginVariables {
  input: {
    username: string;
    password: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loginUser, { loading, error }] =
    useMutation<LoginResponse, LoginVariables>(LOGIN_USER);

  const handleLogin = async () => {
    try {
      const response = await loginUser({
        variables: { input: { username, password } },
      });

      if (!response.data) return;

      const { user, token } = response.data.loginUser;
      setUser(user, token);

      // 🔥 редирект после логина
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-12 shadow-lg dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold text-center">Login</h1>

      <input
        className="rounded border p-3 dark:bg-zinc-800"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        className="rounded border p-3 dark:bg-zinc-800"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="rounded bg-black py-3 text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}