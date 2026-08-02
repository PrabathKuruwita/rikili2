import React from 'react';
import Footer from '../../Footer';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-page-content px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
          <h1 className="mb-2 text-3xl font-semibold text-slate-50">{title}</h1>
          <p className="mb-6 text-sm text-slate-300">{subtitle}</p>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
