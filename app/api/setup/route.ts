import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { initializeSheets, isSheetsConfigured } from "@/lib/google-sheets";

export async function POST(req: Request) {
  const denied = await requireAuth(req);
  if (denied) return denied;
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets not configured" }, { status: 400 });
  }
  try {
    await initializeSheets();
    return NextResponse.json({ ok: true, message: "Sheets initialized successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const denied = await requireAuth(req);
  if (denied) return denied;
  return NextResponse.json({ configured: isSheetsConfigured() });
}
