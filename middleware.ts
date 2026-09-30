import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, buildToken, safeEqual } from "@/lib/auth";

/**
 * Protection optionnelle : inactive tant que `APP_PASSWORD` n'est pas défini.
 *
 * Deux correctifs par rapport à la version précédente :
 *  - le matcher n'exclut plus `api/`, donc les routes d'écriture sont couvertes
 *    (avant, même avec un mot de passe, POST /api/programs restait ouvert) ;
 *  - le cookie contient un jeton dérivé, pas le mot de passe en clair.
 */
export async function middleware(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;
  // La page de connexion et sa route de vérification doivent rester joignables.
  if (pathname === "/login" || pathname === "/api/auth/login") return NextResponse.next();

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  const expected = await buildToken(password);
  if (cookie && safeEqual(cookie, expected)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
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
