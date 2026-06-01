import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { syncUserGuildsFromDiscord } from "@/lib/discord-sync";
import { publishEvent } from "@/lib/redis";

export async function POST() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const result = await syncUserGuildsFromDiscord(session!.user.id);

  if (result.linked > 0) {
    await publishEvent("server:update", { userId: session!.user.id, linked: result.linked });
  }

  return NextResponse.json(result);
}
