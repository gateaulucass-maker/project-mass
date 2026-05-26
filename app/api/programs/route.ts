import { NextResponse } from "next/server";
import { isSheetsConfigured } from "@/lib/google-sheets";
import {
  getPrograms,
  createProgram,
  updateProgram,
  activateProgram,
  deleteProgram,
} from "@/services/sheets-programs";
import { MOCK_PROGRAMS } from "@/lib/mock-data";

export async function GET() {
  if (!isSheetsConfigured()) {
    return NextResponse.json(MOCK_PROGRAMS);
  }
  try {
    const programs = await getPrograms();
    return NextResponse.json(programs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const program = await createProgram(body);
    return NextResponse.json(program);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const { id, action, ...updates } = body;
    if (action === "activate") {
      await activateProgram(id);
    } else {
      await updateProgram(id, updates);
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isSheetsConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  try {
    const { id } = await req.json();
    await deleteProgram(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
