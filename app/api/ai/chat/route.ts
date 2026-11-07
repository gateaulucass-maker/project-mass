import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateAIResponse, type ChatMessage } from "@/services/ai";

const MAX_MESSAGES = 40;
const MAX_CONTENT = 4000;
const MAX_CONTEXT = 8000;

function parseMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null;
  const out: ChatMessage[] = [];
  for (const m of value) {
    if (!m || typeof m !== "object") return null;
    const { role, content } = m as Record<string, unknown>;
    // "system" refusé : le prompt système est fixé côté serveur.
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.length === 0 || content.length > MAX_CONTENT) return null;
    out.push({ role, content });
  }
  return out;
}

export async function POST(request: Request) {
  const denied = await requireAuth(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { messages, userContext } = (body ?? {}) as Record<string, unknown>;
  const parsed = parseMessages(messages);
  if (!parsed) return NextResponse.json({ error: "Messages invalides" }, { status: 400 });
  if (userContext !== undefined && (typeof userContext !== "string" || userContext.length > MAX_CONTEXT)) {
    return NextResponse.json({ error: "Contexte invalide" }, { status: 400 });
  }

  try {
    const message = await generateAIResponse(parsed, userContext as string | undefined);
    return NextResponse.json({ message });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
