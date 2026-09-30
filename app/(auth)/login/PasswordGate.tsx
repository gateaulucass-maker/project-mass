"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Dumbbell, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Formulaire du mot de passe unique, affiché quand APP_PASSWORD est défini. */
export function PasswordGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        toast.error(res.status === 401 ? "Mot de passe incorrect" : "Connexion impossible");
        setLoading(false);
        return;
      }
      router.push(searchParams.get("from") ?? "/");
      router.refresh();
    } catch {
      toast.error("Connexion impossible");
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Project Mass</h1>
          <p className="text-xs text-muted-foreground">Fitness Performance</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Accès protégé</h2>
          <p className="text-muted-foreground mt-1 text-sm">Saisis le mot de passe de l&apos;application.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="app-password" className="text-sm font-medium text-foreground/80">
              Mot de passe
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="app-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/50 focus:border-brand-700/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 gradient-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <>
                Entrer
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
