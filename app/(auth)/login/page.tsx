import { Suspense } from "react";
import { isAuthEnabled } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { PasswordGate } from "./PasswordGate";

/**
 * Composant serveur : APP_PASSWORD ne doit pas fuiter côté client, seul le booléen l'est.
 * Avec un mot de passe défini, on affiche la porte d'entrée ; sinon le formulaire Supabase.
 *
 * Suspense est requis car PasswordGate lit useSearchParams() (le paramètre "from"),
 * ce qui empêche sinon le prérendu statique de /login.
 */
export default function LoginPage() {
  if (!isAuthEnabled()) return <LoginForm />;
  return (
    <Suspense fallback={<div className="h-72" />}>
      <PasswordGate />
    </Suspense>
  );
}
