import { NextResponse } from "next/server";
import { isRedisConfigured } from "@/lib/redis";
import { isAIConfigured } from "@/lib/ai";

function configured(name: string) {
  const v = process.env[name]?.trim() ?? "";
  return v.length > 0 && !v.includes("SEU_TOKEN") && !v.includes("xxxx");
}

export async function GET() {
  const modules = {
    database: configured("DATABASE_URL"),
    auth: configured("AUTH_SECRET"),
    redis: isRedisConfigured(),
    oauth: {
      discord: configured("DISCORD_CLIENT_ID") && configured("DISCORD_CLIENT_SECRET"),
      google: configured("GOOGLE_CLIENT_ID") && configured("GOOGLE_CLIENT_SECRET"),
      github: configured("GITHUB_CLIENT_ID") && configured("GITHUB_CLIENT_SECRET"),
    },
    discordBot: configured("DISCORD_BOT_TOKEN") && configured("DISCORD_BOT_SECRET"),
    stripe: configured("STRIPE_SECRET_KEY"),
    ai: { groq: isAIConfigured() },
  };

  const flags = [
    modules.database,
    modules.auth,
    modules.redis,
    modules.oauth.discord,
    modules.discordBot,
    modules.stripe,
    modules.ai.groq,
  ];

  const percent = Math.round((flags.filter(Boolean).length / flags.length) * 100);

  return NextResponse.json({ percent, modules });
}
