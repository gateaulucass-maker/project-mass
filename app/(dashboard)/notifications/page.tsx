"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trophy, Dumbbell, TrendingUp, CheckCheck, Flame } from "lucide-react";
import { isToday, isYesterday, isThisWeek, parseISO, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { useNotifications, type Notif, type NotifType } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const ICONS: Record<NotifType, { icon: React.ElementType; bg: string; color: string }> = {
  pr: { icon: Trophy, bg: "bg-amber-50", color: "text-amber-600" },
  workout: { icon: Dumbbell, bg: "bg-brand-50", color: "text-brand-700" },
  progress: { icon: TrendingUp, bg: "bg-emerald-50", color: "text-emerald-600" },
  program: { icon: Flame, bg: "bg-orange-50", color: "text-orange-500" },
};

function relativeGroup(iso: string): "Aujourd'hui" | "Cette semaine" | "Plus ancien" {
  const d = parseISO(iso);
  if (isToday(d) || isYesterday(d)) return "Aujourd'hui";
  if (isThisWeek(d, { weekStartsOn: 1 })) return "Cette semaine";
  return "Plus ancien";
}

function formatTime(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return "Aujourd'hui";
  if (isYesterday(d)) return "Hier";
  return format(d, "d MMM", { locale: fr });
}

export default function NotificationsPage() {
  const { notifs, ready, unreadCount, markRead, markAllRead } = useNotifications();

  const groups = (["Aujourd'hui", "Cette semaine", "Plus ancien"] as const)
    .map(label => ({ label, items: notifs.filter(n => relativeGroup(n.createdAt) === label) }))
    .filter(g => g.items.length > 0);

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
                {group.items.map((notif: Notif, i: number) => {
                  const { icon: Icon, bg, color } = ICONS[notif.type];
                  return (
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
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                        <Icon className={cn("w-5 h-5", color)} />
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
                        <p className="text-[10px] text-muted-foreground/60 mt-1.5">{formatTime(notif.createdAt)}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {ready && notifs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-bold mb-1">Aucune notification</p>
            <p className="text-sm text-muted-foreground">Tes séances, records et objectifs apparaîtront ici.</p>
          </motion.div>
        )}

        {ready && notifs.length > 0 && notifs.every(n => n.read) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <p className="text-xs text-muted-foreground">Tout est à jour.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
