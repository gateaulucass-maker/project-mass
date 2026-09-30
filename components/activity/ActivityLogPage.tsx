"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageHeader } from "@/components/shared/PageHeader";
import { ActivityForm, type FormFieldConfig, type FormValues } from "./ActivityForm";
import type { Accent } from "./accent";
import { HeroMetricCard } from "./HeroMetricCard";
import { HistoryList, type HistoryRow } from "./HistoryList";
import { PageSkeleton } from "./PageSkeleton";
import { StatTile, type StatTileProps } from "./StatTile";

export interface ActivityLogPageProps<T extends { id: string }> {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: Accent;
  loading: boolean;
  logs: readonly T[];
  hero: { label: string; value: string; unit: string; subline?: ReactNode };
  addLabel: string;
  form: {
    fields: FormFieldConfig[];
    layout?: "grid" | "inline";
    /** Valide et enregistre ; retourne true en cas de succès. */
    onSubmit: (values: FormValues) => boolean;
    footer?: (values: FormValues) => ReactNode;
  };
  stats: [StatTileProps, StatTileProps, StatTileProps];
  /** Graphique déjà résolu (composant chargé via next/dynamic), affiché si logs.length > 1. */
  chart?: { title: string; element: ReactNode };
  /** Section optionnelle entre le graphique et l'historique. */
  extra?: ReactNode;
  history: {
    renderRow: (item: T, index: number) => HistoryRow;
    onRemove?: (id: string) => void;
    removeLabel?: string;
    limit?: number;
  };
  /** Message de l'état vide ; sans lui, rien n'est affiché quand il n'y a aucune entrée. */
  emptyMessage?: string;
}

export function ActivityLogPage<T extends { id: string }>(props: ActivityLogPageProps<T>) {
  const { title, subtitle, icon: Icon, accent, loading, logs, hero, addLabel, form, stats, chart, extra, history, emptyMessage } = props;
  const [adding, setAdding] = useState(false);

  if (loading) return <PageSkeleton />;

  return (
    <div className="flex-1">
      <Header title={title} subtitle={subtitle} />

      <div className="px-4 lg:px-6 py-5 max-w-3xl space-y-5">
        <PageHeader title={title} icon={Icon} />

        <HeroMetricCard
          accent={accent}
          {...hero}
          addLabel={addLabel}
          expanded={adding}
          onToggle={() => setAdding(!adding)}
        >
          <ActivityForm
            accent={accent}
            fields={form.fields}
            layout={form.layout}
            onSubmit={form.onSubmit}
            onDone={() => setAdding(false)}
            footer={form.footer}
          />
        </HeroMetricCard>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <StatTile key={s.label} {...s} index={i} />
          ))}
        </div>

        {chart && logs.length > 1 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">{chart.title}</h3>
            {chart.element}
          </div>
        )}

        {extra}

        {logs.length > 0 ? (
          <HistoryList items={logs} {...history} />
        ) : (
          emptyMessage && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <Icon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
