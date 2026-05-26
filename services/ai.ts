// AI Coach service — ready to connect to OpenAI or Anthropic

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIServiceConfig {
  provider: "openai" | "anthropic";
  model?: string;
}

const SYSTEM_PROMPT = `Tu es un coach fitness expert spécialisé en musculation et nutrition sportive.
Tu as accès aux données de progression de l'utilisateur et tu peux analyser sa progression,
adapter son programme, et donner des conseils personnalisés sur l'entraînement et la nutrition.
Sois direct, motivant, et donne des conseils pratiques et actionnables.
Réponds en français.`;

// Client-side function that calls the API route
export async function sendChatMessage(
  messages: ChatMessage[],
  userContext?: string
): Promise<string> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, userContext }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.message;
}

// Server-side AI function (used in API route) — uses raw fetch to avoid build-time SDK deps
export async function generateAIResponse(
  messages: ChatMessage[],
  userContext: string = ""
): Promise<string> {
  const systemContent = SYSTEM_PROMPT + (userContext ? `\n\nContexte utilisateur:\n${userContext}` : "");

  // OpenAI implementation via fetch
  if (process.env.OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemContent }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "Je n'ai pas pu générer une réponse.";
  }

  // Anthropic implementation via fetch
  if (process.env.ANTHROPIC_API_KEY) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemContent,
        messages: messages.map(m => ({ role: m.role === "system" ? "user" : m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "Erreur de génération.";
  }

  // Fallback mock response
  return "🤖 Configure ta clé API OpenAI ou Anthropic dans .env.local pour activer le Coach IA.\n\nAjoute `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY` dans ton fichier `.env.local`.";
}
