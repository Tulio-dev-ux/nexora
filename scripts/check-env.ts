/**
 * Verificação completa do .env — npm run db:check
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createRedisClient, isRedisConfigured } from "../src/lib/redis";
import { isAIConfigured } from "../src/lib/ai";

const checks: { name: string; ok: boolean; required: boolean; hint?: string }[] = [];

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function has(name: string) {
  const v = env(name);
  return v.length > 0 && !v.includes("SEU_TOKEN") && !v.includes("xxxx");
}

async function main() {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║     NEXORA AI — Status do ambiente     ║");
  console.log("╚══════════════════════════════════════╝\n");

  checks.push({ name: "DATABASE_URL (Neon)", ok: has("DATABASE_URL"), required: true });
  checks.push({ name: "AUTH_SECRET", ok: has("AUTH_SECRET"), required: true });
  checks.push({ name: "NEXT_PUBLIC_APP_URL", ok: has("NEXT_PUBLIC_APP_URL"), required: true });
  checks.push({ name: "REDIS_URL (Upstash)", ok: isRedisConfigured(), required: false });
  checks.push({ name: "DISCORD_BOT_TOKEN", ok: has("DISCORD_BOT_TOKEN"), required: false });
  checks.push({ name: "DISCORD_BOT_SECRET", ok: has("DISCORD_BOT_SECRET"), required: false });
  checks.push({ name: "GROQ_API_KEY", ok: isAIConfigured(), required: false });
  checks.push({ name: "STRIPE_SECRET_KEY", ok: has("STRIPE_SECRET_KEY"), required: false });

  if (has("DATABASE_URL")) {
    const prisma = new PrismaClient();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.push({ name: "PostgreSQL conectado", ok: true, required: true });
    } catch (e) {
      checks.push({
        name: "PostgreSQL conectado",
        ok: false,
        required: true,
        hint: e instanceof Error ? e.message : "Falha na conexão",
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  if (isRedisConfigured()) {
    const redis = createRedisClient();
    if (redis) {
      try {
        await redis.connect();
        const pong = await redis.ping();
        checks.push({ name: "Redis PING", ok: pong === "PONG", required: false });
        await redis.quit();
      } catch (e) {
        checks.push({
          name: "Redis PING",
          ok: false,
          required: false,
          hint: e instanceof Error ? e.message : "Falha",
        });
      }
    }
  }

  for (const c of checks) {
    const icon = c.ok ? "✓" : c.required ? "✗" : "○";
    const tag = c.required ? "" : " (opcional)";
    console.log(`  ${icon} ${c.name}${tag}${c.hint ? ` — ${c.hint}` : ""}`);
  }

  const failedRequired = checks.filter((c) => c.required && !c.ok);
  console.log("");
  if (failedRequired.length) {
    console.log("Corrija as variáveis obrigatórias no .env e rode novamente.\n");
    process.exit(1);
  }
  console.log("Ambiente OK para desenvolvimento.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
