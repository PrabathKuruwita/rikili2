import React from 'react';

export function AuthField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      {children}
    </div>
  );
}
