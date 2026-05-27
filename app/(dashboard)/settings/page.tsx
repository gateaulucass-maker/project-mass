"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Save, Bell, Target, Shield, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { MOCK_USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function Toggle({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-all flex-shrink-0",
          value ? "bg-brand-700" : "bg-secondary border border-border"
        )}
      >
        <span className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
          value ? "left-[calc(100%-1.375rem)]" : "left-0.5"
        )} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState(MOCK_USER.full_name ?? "");
  const [email, setEmail] = useState(MOCK_USER.email ?? "");
  const [targetWeight, setTargetWeight] = useState("90");
  const [calories, setCalories] = useState("3400");
  const [frequency, setFrequency] = useState("3");
  const [saving, setSaving] = useState(false);

  const [notifWorkout, setNotifWorkout] = useState(true);
  const [notifPR, setNotifPR] = useState(true);
  const [notifProgress, setNotifProgress] = useState(false);

  const inputClass = "w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 transition-all";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success("Paramètres enregistrés");
  }

  return (
    <div className="flex-1">
      <Header title="Paramètres" subtitle="Tes préférences" />

      <div className="px-4 lg:px-6 py-5 max-w-xl space-y-5">
        <PageHeader title="Paramètres" icon={Settings} />

        {/* Profil */}
        <Section title="Profil" delay={0.05}>
          <div className="flex items-center gap-4 pb-2">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white text-xl font-bold glow-brand-sm flex-shrink-0">
              {name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Nom complet">
              <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Adresse email">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </Section>

        {/* Objectifs */}
        <Section title="Objectifs d'entraînement" delay={0.1}>
          <Field label="Poids cible (kg)">
            <input
              type="number"
              step="0.5"
              value={targetWeight}
              onChange={e => setTargetWeight(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Calories journalières cibles">
            <input
              type="number"
              step="50"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Fréquence hebdomadaire" hint="Nombre de séances par semaine">
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(String(f))}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                    frequency === String(f)
                      ? "gradient-brand text-white border-transparent glow-brand-sm"
                      : "bg-secondary text-muted-foreground border-border hover:border-brand-700/30"
                  )}
                >
                  {f}×
                </button>
              ))}
            </div>
          </Field>
          <button
            onClick={() => toast.success("Objectifs mis à jour")}
            className="flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 transition-all"
          >
            <Target className="w-4 h-4" />
            Mettre à jour
          </button>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" delay={0.15}>
          <Toggle
            label="Rappel séance"
            description="Te notifie quand c'est l'heure de t'entraîner"
            value={notifWorkout}
            onChange={setNotifWorkout}
          />
          <div className="border-t border-border" />
          <Toggle
            label="Nouveaux records"
            description="Alerte dès qu'un PR est battu"
            value={notifPR}
            onChange={setNotifPR}
          />
          <div className="border-t border-border" />
          <Toggle
            label="Résumé hebdomadaire"
            description="Récap de la semaine chaque dimanche"
            value={notifProgress}
            onChange={setNotifProgress}
          />
        </Section>

        {/* Liens rapides */}
        <Section title="Navigation rapide" delay={0.2}>
          <div className="space-y-1 -my-1">
            {[
              { href: "/profile", icon: User, label: "Mon profil", sub: "Voir tes stats et records" },
              { href: "/notifications", icon: Bell, label: "Notifications", sub: "Gérer tes alertes" },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-3 py-2.5 group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-700 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* App */}
        <Section title="Application" delay={0.25}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Version</p>
                <p className="text-xs text-muted-foreground">Project Mass v1.0</p>
              </div>
              <span className="text-xs px-2 py-1 bg-secondary rounded-lg text-muted-foreground font-mono">v1.0.0</span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Base de données</p>
                <p className="text-xs text-muted-foreground">Google Sheets</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Connecté</span>
              </div>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sécurité</p>
                <p className="text-xs text-muted-foreground">Données chiffrées</p>
              </div>
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
