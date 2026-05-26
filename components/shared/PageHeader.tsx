"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-2xl gradient-violet flex items-center justify-center glow-violet-sm flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
