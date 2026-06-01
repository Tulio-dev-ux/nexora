import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

const CLIENT_ID =
  process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? process.env.DISCORD_CLIENT_ID ?? "";

/** Permissões: moderação, mensagens, canais, comandos slash */
const DEFAULT_PERMISSIONS = "1099511709696";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  if (!CLIENT_ID) {
    return NextResponse.json({ error: "DISCORD_CLIENT_ID não configurado" }, { status: 500 });
  }

  const permissions = process.env.DISCORD_BOT_PERMISSIONS ?? DEFAULT_PERMISSIONS;
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${permissions}&scope=bot%20applications.commands`;

  return NextResponse.json({ url, clientId: CLIENT_ID });
}
