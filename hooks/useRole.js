"use client";

import { useAuth } from "@/hooks/useAuth";

export function useRole() {
  const { profile, loading } = useAuth();
  const role = profile?.role ?? null;

  return {
    role,
    loading,
    isAdmin: role === "admin",
    isStudent: role === "student",
    isLecturer: role === "lecturer",
    isStaff: role === "staff",
    isVisitor: role === "visitor",
  };
}
