import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, apiClosedByDefault, authState, isValidSessionToken } from "@/lib/auth";

/**
 * - Sans mot de passe : pages ouvertes, routes /api/* fermées en production (503).
 * - Mot de passe sans AUTH_SECRET : tout est fermé (échec sûr).
 * - Mot de passe + AUTH_SECRET : cookie de session signé exigé partout sauf /login.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const state = authState();

  if (state === "disabled") {
    if (isApi && apiClosedByDefault()) {
      return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
    }
    return NextResponse.next();
  }

  if (state === "misconfigured") {
    return isApi
      ? NextResponse.json({ error: "Service indisponible" }, { status: 503 })
      : new NextResponse("Configuration incomplète : AUTH_SECRET manquant.", { status: 503 });
  }

  // La page de connexion et sa route de vérification doivent rester joignables.
  if (pathname === "/login" || pathname === "/api/auth/login") return NextResponse.next();

  if (await isValidSessionToken(request.cookies.get(AUTH_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
