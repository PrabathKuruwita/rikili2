import React from 'react';
import type { AppointmentStatus } from '../../types';
import { Badge } from '../ui/primitives';

export function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function fmtShort(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function currency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

const statusTone: Record<
  AppointmentStatus,
  'blue' | 'green' | 'slate' | 'amber'
> = {
  upcoming: 'blue',
  completed: 'green',
  cancelled: 'slate',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge tone={statusTone[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
