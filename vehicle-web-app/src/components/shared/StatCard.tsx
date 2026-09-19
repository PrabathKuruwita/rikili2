import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui/primitives';

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: { value: string; up: boolean };
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent">
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span
              className={`text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}
            >
              {trend.up ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
        <p className="mt-4 text-2xl font-semibold text-slate-900">{value}</p>
        <p className="mt-0.5 text-sm text-slate-500">{label}</p>
      </Card>
    </motion.div>
  );
}
