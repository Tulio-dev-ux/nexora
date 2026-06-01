# NEXORA AI

Enterprise-grade artificial intelligence platform built for modern communities.

## Quick Start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env
# Cole URLs do Neon (PostgreSQL) e Upstash (Redis)

# 3. Validate, migrate & seed
npm run db:check
npm run db:push
npm run db:seed

# 4. Run (Next.js + WebSocket server)
npm run dev

# 5. Discord Bot (separate terminal)
npm run bot
```

Open [http://localhost:3000](http://localhost:3000)

**Default admin:** `admin@nexora.ai` / `admin123456` (after seed)

---

## Infraestrutura (Neon + Upstash)

Sem Docker obrigatório. Banco e cache na nuvem:

- **PostgreSQL** → [neon.tech](https://neon.tech)
- **Redis** → [upstash.com](https://upstash.com)

---

## Architecture

```
nexora-ai/
├── src/app/api/          # REST API routes
├── src/lib/              # Auth, AI (Groq), Stripe, Redis, Prisma
├── server/index.ts       # Custom server (Next.js + Socket.io)
├── bot/index.ts          # Discord bot (discord.js)
└── prisma/schema.prisma
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js + Socket.io via `tsx server/index.ts` |
| `npm run bot` | Discord bot |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run db:check` | Validate .env + DB/Redis |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Seed admin + live metrics |

## AI

All AI features use **Groq** via the OpenAI-compatible API (`GROQ_API_KEY`). No OpenAI/Anthropic/Gemini keys required.

## Discord

- Slash command: `/nexora` (status, moderar, ticket, moderação, etc.)
- Bot events: `POST /api/discord/events` with `DISCORD_BOT_SECRET`

## License

Private / All rights reserved — NEXORA AI.
