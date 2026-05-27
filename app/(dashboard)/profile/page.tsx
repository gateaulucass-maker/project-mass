"use client";

import { motion } from "framer-motion";
import { Mail, Calendar, Dumbbell, TrendingUp, Trophy, Target, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/Header";
import { MOCK_USER, MOCK_BODYWEIGHT, MOCK_PERSONAL_RECORDS, MOCK_PROGRAMS } from "@/lib/mock-data";

export default function ProfilePage() {
  const currentWeight = MOCK_BODYWEIGHT[MOCK_BODYWEIGHT.length - 1].weight;
  const startWeight = MOCK_BODYWEIGHT[0].weight;
  const weightGained = (currentWeight - startWeight).toFixed(1);
  const activeProgram = MOCK_PROGRAMS.find(p => p.is_active);
  const memberSince = format(parseISO(MOCK_USER.created_at), "MMMM yyyy", { locale: fr });
  const newPRs = MOCK_PERSONAL_RECORDS.filter(pr => pr.is_new).length;

  const stats = [
    { label: "Séances totales", value: "47", icon: Dumbbell, iconColor: "text-brand-700", bg: "bg-brand-50" },
    { label: "Poids gagné", value: `+${weightGained} kg`, icon: TrendingUp, iconColor: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Records PR", value: String(newPRs), icon: Trophy, iconColor: "text-amber-600", bg: "bg-amber-50" },
    { label: "Objectif", value: `${activeProgram?.target_weight ?? 90} kg`, icon: Target, iconColor: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="flex-1">
      <Header title="Profil" />

      <div className="px-4 lg:px-6 py-5 max-w-xl space-y-5">
        {/* Avatar + infos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 flex items-center gap-5"
        >
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-white text-2xl font-bold glow-brand-sm flex-shrink-0">
            {MOCK_USER.full_name?.charAt(0) ?? "L"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{MOCK_USER.full_name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{MOCK_USER.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              Membre depuis {memberSince}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Programme actif */}
        {activeProgram && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href={`/programs/${activeProgram.id}`}>
              <div className="bg-card border border-brand-700/20 rounded-2xl p-5 hover:border-brand-700/40 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-brand-700 font-semibold mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-700 animate-pulse inline-block" />
                      Programme actif
                    </p>
                    <p className="font-bold truncate">{activeProgram.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {currentWeight} kg → {activeProgram.target_weight} kg
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-700 transition-colors flex-shrink-0 ml-3" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Records */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm">Records personnels</h2>
            <Link href="/progress" className="text-xs text-brand-700 hover:text-brand-400 transition-colors">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-border">
            {MOCK_PERSONAL_RECORDS.slice(0, 4).map((pr, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy className={`w-3.5 h-3.5 flex-shrink-0 ${pr.is_new ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium truncate">{pr.exercise_name}</span>
                  {pr.is_new && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-brand-700/15 text-brand-700 rounded-full flex-shrink-0">PR</span>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="text-sm font-bold">{pr.weight} kg</span>
                  <span className="text-xs text-muted-foreground ml-1">× {pr.reps}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lien paramètres */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/settings">
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl p-5 hover:border-brand-700/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Paramètres du profil</p>
                  <p className="text-xs text-muted-foreground">Modifier nom, email, préférences</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-700 transition-colors" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
