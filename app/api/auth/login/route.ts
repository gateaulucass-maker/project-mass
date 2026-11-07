import { NextResponse } from "next/server";
import { AUTH_COOKIE, SESSION_SECONDS, authState, createSessionToken, isValidPassword } from "@/lib/auth";

const FAIL_DELAY_MS = 800;

/** Vérifie le mot de passe et pose le cookie de session signé (httpOnly). */
export async function POST(request: Request) {
  if (authState() !== "enabled") {
    return NextResponse.json({ error: "Connexion indisponible" }, { status: 503 });
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0 || password.length > 200) {
    return NextResponse.json({ error: "Mot de passe invalide" }, { status: 400 });
  }

  if (!(await isValidPassword(password))) {
    // Délai fixe : ralentit la force brute (pas de stockage partagé pour une vraie limite par IP).
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return res;
}
