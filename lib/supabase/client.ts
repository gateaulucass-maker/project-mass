import { createBrowserClient } from "@supabase/ssr";

/**
 * Renvoie `null` si Supabase n'est pas configuré, au lieu de laisser
 * `createBrowserClient(undefined!, undefined!)` planter à l'exécution :
 * la page de connexion peut alors afficher un message clair.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Variante pour le code qui ne peut pas fonctionner sans Supabase.
 * Échoue avec un message explicite plutôt que sur un `undefined` opaque.
 */
export function createClientOrThrow() {
  const client = createClient();
  if (!client) {
    throw new Error(
      "Supabase n'est pas configuré : renseigne NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return client;
}
