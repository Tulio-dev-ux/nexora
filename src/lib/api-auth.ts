import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if (session!.user.role !== "ADMIN") {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null };
}

export function hasRole(role: UserRole, required: UserRole) {
  if (required === "USER") return true;
  return role === "ADMIN";
}
