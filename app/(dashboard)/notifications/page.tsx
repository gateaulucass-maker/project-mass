"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trophy, Dumbbell, TrendingUp, Target, CheckCheck, Flame } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

type NotifType = "pr" | "workout" | "progress" | "program";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const INITIAL_NOTIFS: Notif[] = [
  {
    id: "n1",
    type: "pr",
    title: "Nouveau record — Développé couché",
    body: "100 kg × 1 rep. Un nouveau PR établi !",
    time: "Aujourd'hui",
    read: false,
    icon: Trophy,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "n2",
    type: "workout",
    title: "Séance du jour : Pull",
    body: "Il est temps de faire ta séance Dos / Biceps.",
    time: "Aujourd'hui",
    read: false,
    icon: Dumbbell,
    iconBg: "bg-brand-50",
    iconColor: "text-brand-700",
  },
  {
    id: "n3",
    type: "progress",
    title: "Objectif presque atteint",
    body: "Tu es à 1.2 kg de ton objectif de 90 kg. Encore un effort !",
    time: "Hier",
    read: false,
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: "n4",
    type: "program",
    title: "Programme bientôt terminé",
    body: "Il reste 5 jours à ton programme PPL Mass. Pense à planifier la suite.",
    time: "Il y a 2 jours",
    read: true,
    icon: Flame,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    id: "n5",
    type: "workout",
    title: "Séance Push complétée",
    body: "Bravo, tu as terminé ta séance Push de la semaine !",
    time: "Il y a 3 jours",
    read: true,
    icon: Dumbbell,
    iconBg: "bg-brand-50",
    iconColor: "text-brand-700",
  },
  {
    id: "n6",
    type: "pr",
    title: "Record — Presse à cuisses",
    body: "85 kg × 10 reps. Tu progresses sur les jambes.",
    time: "Il y a 5 jours",
    read: true,
    icon: Trophy,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    id: "n7",
    type: "progress",
    title: "Prise de masse en bonne voie",
    body: "+12 kg depuis la reprise en février. Objectif : +12 kg visé.",
    time: "Il y a 1 semaine",
    read: true,
    icon: Target,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);

  const unreadCount = notifs.filter(n => !n.read).length;

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const todayNotifs = notifs.filter(n => n.time === "Aujourd'hui");
  const recentNotifs = notifs.filter(n => n.time === "Hier" || n.time.startsWith("Il y a") && !n.time.includes("semaine"));
  const olderNotifs = notifs.filter(n => n.time.includes("semaine"));

  const groups = [
    { label: "Aujourd'hui", items: todayNotifs },
    { label: "Cette semaine", items: recentNotifs },
    { label: "Plus ancien", items: olderNotifs },
  ].filter(g => g.items.length > 0);

  return (
    <div className="flex-1">
      <Header title="Notifications" />

      <div className="px-4 lg:px-6 py-5 max-w-xl space-y-5">
        <PageHeader
          title="Notifications"
          icon={Bell}
          action={
            unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 rounded-xl transition-all border border-brand-200"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout lire
              </button>
            ) : null
          }
        />

        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-brand-50 border border-brand-200 rounded-xl"
          >
            <span className="w-2 h-2 rounded-full bg-brand-700 animate-pulse" />
            <p className="text-xs font-semibold text-brand-700">
              {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}
            </p>
          </motion.div>
        )}

        {groups.map((group, gi) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {group.label}
            </p>
            <div className="space-y-2">
              <AnimatePresence>
                {group.items.map((notif, i) => (
                  <motion.button
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (gi * 3 + i) * 0.04 }}
                    onClick={() => markRead(notif.id)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-all",
                      notif.read
                        ? "bg-card border-border hover:border-border/80"
                        : "bg-card border-brand-700/20 hover:border-brand-700/40"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", notif.iconBg)}>
                      <notif.icon className={cn("w-5 h-5", notif.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-semibold leading-tight", notif.read && "font-medium text-foreground/80")}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-700 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">{notif.time}</p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {notifs.every(n => n.read) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-bold mb-1">Tout est à jour</p>
            <p className="text-sm text-muted-foreground">Aucune nouvelle notification.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
