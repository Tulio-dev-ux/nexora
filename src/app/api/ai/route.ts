import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { chatCompletion, isAIConfigured, type AIMessage } from "@/lib/ai";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!isAIConfigured()) {
    return NextResponse.json({ error: "GROQ_API_KEY não configurada" }, { status: 503 });
  }

  const { module, messages, serverId, maxTokens } = await request.json() as {
    module: string;
    messages: AIMessage[];
    serverId?: string;
    maxTokens?: number;
  };

  if (!module || !messages?.length) {
    return NextResponse.json({ error: "module and messages required" }, { status: 400 });
  }

  const response = await chatCompletion({
    module,
    messages,
    userId: session!.user.id,
    serverId,
    maxTokens,
  });

  return NextResponse.json({ response });
}
