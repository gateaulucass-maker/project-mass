import "server-only";

/**
 * Protection optionnelle par mot de passe unique (application personnelle).
 *
 * Elle reste DÉSACTIVÉE tant que `APP_PASSWORD` n'est pas défini, donc le
 * comportement actuel ne change pas. Auparavant, la définir enfermait tout le monde
 * dehors : le middleware attendait un cookie `app_auth` que rien n'écrivait, et le
 * matcher excluait `api/`, laissant les routes d'écriture ouvertes.
 *
 * Le cookie contient désormais un jeton dérivé du mot de passe (HMAC), et non le mot
 * de passe en clair, et il est posé en `httpOnly`.
 */

export const AUTH_COOKIE = "pm_auth";

function getSecret(): string | null {
  const pwd = process.env.APP_PASSWORD;
  return pwd && pwd.length > 0 ? pwd : null;
}

export function isAuthEnabled(): boolean {
  return getSecret() !== null;
}

/** Jeton opaque dérivé du mot de passe. Web Crypto : compatible runtime Edge. */
export async function buildToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`pm-v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparaison à temps constant : évite de fuiter le préfixe correct par le timing. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidPassword(candidate: string): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;
  return safeEqual(await buildToken(candidate), await buildToken(secret));
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return true; // protection désactivée
  if (!token) return false;
  return safeEqual(token, await buildToken(secret));
}

/** Garde à appeler en tête des routes API. `null` = requête autorisée. */
export async function requireAuth(request: Request): Promise<Response | null> {
  if (!isAuthEnabled()) return null;
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE}=([^;]+)`));
  if (await isValidToken(match?.[1])) return null;
  return Response.json({ error: "Non autorisé" }, { status: 401 });
}
