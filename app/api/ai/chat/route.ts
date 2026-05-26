import { NextResponse } from "next/server";
import { generateAIResponse } from "@/services/ai";

export async function POST(request: Request) {
  try {
    const { messages, userContext } = await request.json();
    const message = await generateAIResponse(messages, userContext);
    return NextResponse.json({ message });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
