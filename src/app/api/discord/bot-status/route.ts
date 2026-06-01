import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  let botOnline = false;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/discord/events`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DISCORD_BOT_SECRET ?? ""}`,
        },
        cache: "no-store",
      }
    );
    botOnline = res.ok;
  } catch {
    botOnline = false;
  }

  return NextResponse.json({ botOnline });
}
