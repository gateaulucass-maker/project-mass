import { NextResponse, type NextRequest } from "next/server";

// Auth désactivée — app personnelle, accès direct
// Pour protéger l'app, ajouter APP_PASSWORD dans .env.local

export function middleware(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();

  const isAuthRoute = request.nextUrl.pathname === "/login";
  const cookie = request.cookies.get("app_auth")?.value;

  if (!isAuthRoute && cookie !== password) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
