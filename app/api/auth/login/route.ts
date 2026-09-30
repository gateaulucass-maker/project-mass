import { NextResponse } from "next/server";
import { AUTH_COOKIE, buildToken, isAuthEnabled, isValidPassword } from "@/lib/auth";

/** Vérifie le mot de passe et pose le cookie de session (httpOnly, donc non rejouable depuis JS). */
export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: "Protection désactivée" }, { status: 400 });
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
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await buildToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
