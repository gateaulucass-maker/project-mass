import { NextResponse } from "next/server";
import { initializeSheets, isSheetsConfigured } from "@/lib/google-sheets";

export async function POST() {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Google Sheets not configured" }, { status: 400 });
  }
  try {
    await initializeSheets();
    return NextResponse.json({ ok: true, message: "Sheets initialized successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ configured: isSheetsConfigured() });
}
