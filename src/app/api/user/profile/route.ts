import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      discordId: true,
      twoFactorEnabled: true,
      createdAt: true,
      subscription: true,
      accounts: { select: { provider: true } },
    },
  });

  const hasDiscord = Boolean(
    user?.discordId || user?.accounts.some((a) => a.provider === "discord")
  );

  return NextResponse.json({ user: user ? { ...user, hasDiscord } : null });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { name } = await request.json();

  const user = await prisma.user.update({
    where: { id: session!.user.id },
    data: { name: name ?? undefined },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user });
}
