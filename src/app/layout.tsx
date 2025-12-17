"use client";

import { Header } from "@/components/Header";
import { Geist, Geist_Mono } from "next/font/google";
import { ApolloWrapper } from "@/providers/ApolloProvider";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/stores/useStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = pathname === "/login" || pathname === "/register";
  const initializeAuth = useStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  return (
    <>
      <html>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans bg-zinc-50 dark:bg-black text-black dark:text-white min-h-screen`}
        >
        <main className={hideHeader ? "w-full min-h-screen flex items-center justify-center p-4" : "w-full"}>
          {!hideHeader && <Header />}
          <ApolloWrapper>{children}</ApolloWrapper>
        </main> 
        </body>
      </html>
    </>
  );
}