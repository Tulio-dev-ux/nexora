export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-transforming-discord-communities",
    title: "How AI is Transforming Discord Community Management",
    excerpt:
      "Discover how enterprise-grade AI moderation is changing the way communities operate at scale.",
    category: "AI",
    date: "28 Mai 2026",
    readTime: "5 min",
    content: [
      "Community managers spend hours on repetitive moderation tasks. NEXORA AI automates spam detection, raid prevention, and toxic content analysis using Groq-powered models with sub-second response times.",
      "Our moderation pipeline analyzes every message against behavioral patterns, malicious links, and harassment categories. Actions range from allow to warn, mute, or ban — with confidence scores logged for audit.",
      "Teams using NEXORA report up to 80% reduction in manual moderation workload while improving response consistency across time zones.",
    ],
  },
  {
    slug: "bulletproof-anti-raid-systems",
    title: "Building Bulletproof Anti-Raid Systems",
    excerpt:
      "A deep dive into behavioral analysis and real-time threat detection for Discord servers.",
    category: "Security",
    date: "22 Mai 2026",
    readTime: "8 min",
    content: [
      "Raids exploit join velocity and coordinated messaging. NEXORA combines Discord gateway events with Redis pub/sub to detect anomalies within milliseconds.",
      "Configure thresholds per server: max joins per minute, duplicate account patterns, and mass-mention triggers. Automations can lock channels, enable verification, or alert moderators instantly.",
      "Security logs in the dashboard provide full traceability for compliance and post-incident review.",
    ],
  },
  {
    slug: "ai-ticket-agents",
    title: "Automating Support with AI Ticket Agents",
    excerpt: "Learn how to reduce response times by 90% with intelligent ticket automation.",
    category: "Automation",
    date: "15 Mai 2026",
    readTime: "6 min",
    content: [
      "The NEXORA assistant module uses contextual server data to answer FAQs before a human moderator steps in. Tickets are created via dashboard or Discord commands and synced to PostgreSQL.",
      "Integrate with your knowledge base by passing context to POST /api/ai with action assistant. Groq generates concise, on-brand replies tracked in AIUsage for cost monitoring.",
    ],
  },
  {
    slug: "community-analytics-future",
    title: "The Future of Community Analytics",
    excerpt: "Advanced metrics and retention analysis powered by machine learning.",
    category: "Technology",
    date: "8 Mai 2026",
    readTime: "7 min",
    content: [
      "Live metrics stream through Socket.io when Redis is configured. Historical data lives in LiveMetric and dashboard APIs for growth, retention, and channel activity charts.",
      "The analytics AI module summarizes trends and recommends actions — upgrade plans, enable anti-raid, or optimize automations based on usage patterns.",
    ],
  },
  {
    slug: "discord-api-best-practices-2026",
    title: "Discord API Best Practices for 2026",
    excerpt: "Optimize your bot integrations with the latest Discord API features and patterns.",
    category: "Discord",
    date: "1 Mai 2026",
    readTime: "10 min",
    content: [
      "Run the NEXORA bot separately with npm run bot. Events POST to /api/discord/events with DISCORD_BOT_SECRET for authentication.",
      "Use OAuth2 for user login (not the bot token). Register redirect URIs for each environment. Pool database connections via Neon pooler for serverless Next.js.",
    ],
  },
  {
    slug: "scaling-100k-members",
    title: "Scaling to 100K Members: A Case Study",
    excerpt:
      "How one community used NEXORA AI to manage explosive growth without adding moderators.",
    category: "AI",
    date: "24 Abr 2026",
    readTime: "12 min",
    content: [
      "A gaming community grew from 12K to 100K members in six weeks. Manual moderation couldn't scale. They deployed NEXORA Pro with automations for welcome flows, AI moderation, and ticket routing.",
      "Stripe billing scaled with them — Starter to Pro upgrade triggered automatically when server limits were hit. Redis live events kept the dashboard accurate during peak traffic.",
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
