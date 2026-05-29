"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Client-side auth gate for protected pages.
 *
 * Returns `authorized` — only true once auth has resolved AND the user is
 * allowed. Pages should:
 *   1. early-return a spinner while `!authorized` (prevents content flash), and
 *   2. gate any data fetch / image preload effects on `authorized`
 *      (prevents firing requests before the redirect to /login completes).
 *
 * It also performs the redirect itself when the user is not allowed.
 */
export function useRequireAuth(opts?: { admin?: boolean }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const authorized =
    !isLoading && isAuthenticated && (!opts?.admin || user?.role === "admin");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || (opts?.admin && user?.role !== "admin")) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, user?.role, opts?.admin, router]);

  return { authorized, isLoading, user };
}
