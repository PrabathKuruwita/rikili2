import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { Card } from '../ui/primitives';

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  index = 0,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.05,
        duration: 0.25,
      }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent">
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                trend.up ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend.up ? (
                <TrendingUpIcon className="h-3.5 w-3.5" />
              ) : (
                <TrendingDownIcon className="h-3.5 w-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
        <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">{label}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </Card>
    </motion.div>
  );
}
