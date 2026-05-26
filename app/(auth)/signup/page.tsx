"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell, Mail, Lock, User, ArrowRight, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const features = [
  "Suivi séances & exercices",
  "Graphiques progression",
  "Coach IA intégré",
  "Tracking poids",
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Compte créé ! Vérifie ton email.");
    router.push("/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl gradient-violet flex items-center justify-center glow-violet">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Project Mass</h1>
          <p className="text-xs text-muted-foreground">Fitness Performance</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-card-dark">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Créer un compte</h2>
          <p className="text-muted-foreground mt-1 text-sm">Commence à tracker ta progression</p>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-violet-400" />
              </div>
              {f}
            </div>
          ))}
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Prénom</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Lucas"
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 gradient-violet text-white font-semibold rounded-xl flex items-center justify-center gap-2 glow-violet-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
