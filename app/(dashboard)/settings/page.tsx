"use client";

import { useState } from "react";
import { User, Save } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { MOCK_USER } from "@/lib/mock-data";

export default function SettingsPage() {
  const [name, setName] = useState(MOCK_USER.full_name ?? "");
  const [email, setEmail] = useState(MOCK_USER.email ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success("Profil mis a jour");
  }

  return (
    <div className="flex-1">
      <Header title="Parametres" subtitle="Ton profil et tes preferences" />

      <div className="px-4 lg:px-6 py-5 max-w-xl space-y-5">
        <PageHeader title="Parametres" icon={User} />

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Profil</h2>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Nom complet</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 gradient-brand text-white text-sm font-semibold rounded-xl glow-brand-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Application</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Version</p>
                <p className="text-xs text-muted-foreground">Project Mass v1.0</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Base de donnees</p>
                <p className="text-xs text-muted-foreground">Google Sheets — connecte</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
