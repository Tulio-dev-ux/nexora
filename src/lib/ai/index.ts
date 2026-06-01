import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export type AIProvider = "groq";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIRequest {
  provider?: AIProvider;
  module: string;
  messages: AIMessage[];
  userId?: string;
  serverId?: string;
  maxTokens?: number;
}

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function isAIConfigured() {
  const key = process.env.GROQ_API_KEY?.trim() ?? "";
  return key.length > 0 && !key.includes("SEU_TOKEN") && !key.includes("xxxx");
}

function getGroqClient() {
  if (!isAIConfigured()) {
    throw new Error("GROQ_API_KEY não configurada");
  }
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: GROQ_BASE_URL,
  });
}

function getModel() {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
}

async function trackUsage(
  module: string,
  tokens: number,
  userId?: string,
  serverId?: string
) {
  const costPerToken = 0.0000005;
  await prisma.aIUsage.create({
    data: {
      provider: "groq",
      module,
      tokens,
      cost: tokens * costPerToken,
      userId,
      serverId,
    },
  });
}

export async function chatCompletion(request: AIRequest): Promise<string> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: getModel(),
    messages: request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: request.maxTokens ?? 1024,
  });

  const response = completion.choices[0]?.message?.content ?? "";
  const tokens = completion.usage?.total_tokens ?? Math.ceil(response.length / 4);

  await trackUsage(request.module, tokens, request.userId, request.serverId);
  return response;
}

export async function moderateContent(content: string, userId?: string, serverId?: string) {
  const systemPrompt = `You are an AI moderation system. Analyze the message and respond ONLY with valid JSON:
{"action":"allow"|"warn"|"mute"|"ban","confidence":0-1,"reason":"brief reason","categories":["spam"|"raid"|"malicious_link"|"harassment"|"none"]}`;

  const result = await chatCompletion({
    module: "moderation",
    userId,
    serverId,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Analyze: ${content}` },
    ],
    maxTokens: 256,
  });

  try {
    return JSON.parse(result) as {
      action: string;
      confidence: number;
      reason: string;
      categories: string[];
    };
  } catch {
    return { action: "allow", confidence: 0.5, reason: "Parse error", categories: ["none"] };
  }
}

export async function generateAssistantReply(
  question: string,
  context: string,
  userId?: string
) {
  return chatCompletion({
    module: "assistant",
    userId,
    messages: [
      {
        role: "system",
        content: `You are NEXORA AI Assistant. Context: ${context}. Be helpful and concise.`,
      },
      { role: "user", content: question },
    ],
  });
}

export async function analyzeAnalytics(data: string, userId?: string) {
  return chatCompletion({
    module: "analytics",
    userId,
    messages: [
      {
        role: "system",
        content: "You are an analytics AI. Provide insights and recommendations based on community data.",
      },
      { role: "user", content: data },
    ],
  });
}
