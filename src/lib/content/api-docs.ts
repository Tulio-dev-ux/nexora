export const apiEndpoints = [
  {
    method: "GET",
    path: "/api/dashboard",
    description: "Estatísticas do painel do usuário autenticado",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/ai",
    description: "Chat completion via Groq (OpenAI-compatible)",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/discord/servers",
    description: "Lista servidores vinculados",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/discord/sync",
    description: "Sincroniza guilds do OAuth Discord",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/discord/events",
    description: "Webhook interno do bot (Bearer DISCORD_BOT_SECRET)",
    auth: "bot",
  },
  {
    method: "GET",
    path: "/api/billing",
    description: "Assinatura e planos",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/billing/checkout",
    description: "Cria sessão Stripe Checkout",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/billing/portal",
    description: "Portal do cliente Stripe",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/status",
    description: "Status público dos serviços",
    auth: "none",
  },
];

export const rateLimits = {
  authenticated: "100 req/min",
  bot: "500 req/min",
  public: "30 req/min",
};
