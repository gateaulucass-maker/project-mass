/**
 * Protection par mot de passe unique (application personnelle).
 *
 * - `APP_PASSWORD` + `AUTH_SECRET` définis : /login demande le mot de passe, tout est fermé sans cookie.
 * - `APP_PASSWORD` défini sans `AUTH_SECRET` : configuration incomplète, tout est fermé (échec sûr).
 * - Rien de défini : les pages restent ouvertes (données en localStorage), mais les routes
 *   /api/* sont fermées en production (voir `apiClosedByDefault`).
 *
 * Jeton de session : `<expiration>.<HMAC-SHA256(AUTH_SECRET, "pm-v2|" + expiration + "|" + mot de passe)>`.
 * La clé secrète empêche l'attaque hors ligne d'un cookie volé, l'expiration est signée,
 * et changer le mot de passe ou le secret invalide toutes les sessions.
 * Web Crypto uniquement : compatible runtime Edge (middleware).
 */

export const AUTH_COOKIE = "pm_auth";
export const SESSION_SECONDS = 60 * 60 * 24 * 30;

type AuthState = "disabled" | "enabled" | "misconfigured";

export function authState(): AuthState {
  const pwd = process.env.APP_PASSWORD;
  if (!pwd) return "disabled";
  const secret = process.env.AUTH_SECRET;
  return secret && secret.length >= 32 ? "enabled" : "misconfigured";
}

/** Sans mot de passe configuré, les routes API ne sont pas exposées en production. */
export function apiClosedByDefault(): boolean {
  return authState() === "disabled" && process.env.NODE_ENV === "production";
}

async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparaison à temps constant (les deux chaînes sont des hex de longueur fixe). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Crée un jeton de session signé. À appeler seulement si `authState() === "enabled"`. */
export async function createSessionToken(nowMs = Date.now()): Promise<string> {
  const exp = Math.floor(nowMs / 1000) + SESSION_SECONDS;
  const sig = await hmacHex(process.env.AUTH_SECRET!, `pm-v2|${exp}|${process.env.APP_PASSWORD}`);
  return `${exp}.${sig}`;
}

export async function isValidSessionToken(token: string | undefined, nowMs = Date.now()): Promise<boolean> {
  if (authState() !== "enabled" || !token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  if (!/^\d{1,12}$/.test(expStr)) return false;
  const exp = Number(expStr);
  if (exp * 1000 <= nowMs) return false;
  const expected = await hmacHex(process.env.AUTH_SECRET!, `pm-v2|${exp}|${process.env.APP_PASSWORD}`);
  return safeEqual(token.slice(dot + 1), expected);
}

export async function isValidPassword(candidate: string): Promise<boolean> {
  if (authState() !== "enabled") return false;
  // HMAC des deux côtés : longueurs égales, comparaison à temps constant.
  const key = process.env.AUTH_SECRET!;
  return safeEqual(
    await hmacHex(key, `pwd|${candidate}`),
    await hmacHex(key, `pwd|${process.env.APP_PASSWORD}`)
  );
}

function readCookie(request: Request): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE}=([^;]+)`));
  return match?.[1];
}

/** Garde à appeler en tête des routes API (défense en profondeur). `null` = autorisé. */
export async function requireAuth(request: Request): Promise<Response | null> {
  const state = authState();
  if (state === "disabled") {
    if (apiClosedByDefault()) {
      return Response.json({ error: "Service indisponible" }, { status: 503 });
    }
    return null; // développement local sans mot de passe
  }
  if (state === "misconfigured") {
    return Response.json({ error: "Service indisponible" }, { status: 503 });
  }
  if (await isValidSessionToken(readCookie(request))) return null;
  return Response.json({ error: "Non autorisé" }, { status: 401 });
}
