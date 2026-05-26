import { NextResponse } from "next/server";
import { isSheetsConfigured } from "@/lib/google-sheets";
import { getBodyweightLogs, logBodyweight } from "@/services/sheets-bodyweight";
import { MOCK_BODYWEIGHT } from "@/lib/mock-data";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json(MOCK_BODYWEIGHT);
  }
  try {
    const logs = await getBodyweightLogs();
    return NextResponse.json(logs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  try {
    const { weight } = await req.json();
    const log = await logBodyweight(parseFloat(weight));
    return NextResponse.json(log);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
