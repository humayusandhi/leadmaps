'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FloatingNav } from '@/components/shared/FloatingNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    }
  }, [isLoading, token, router]);

  // Loading skeleton placeholder (strict ban on circular spinners per DESIGN.md Section 4.4)
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#090A0D] text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-48 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] animate-pulse" />
        <div className="w-full max-w-4xl h-72 rounded-2xl bg-white/[0.03] border border-white/[0.08] animate-pulse" />
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Hydrating Session Context...
        </p>
      </div>
    );
  }

  // Not authenticated redirecting state
  if (!token && !user) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#090A0D] text-slate-100 relative overflow-x-hidden flex flex-col">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Floating Island Navigation */}
      <FloatingNav />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Cockpit Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <div>LeadMap AI Cockpit &bull; Multi-Tenant v1.0.0</div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            API Gateway Online
          </span>
          <span>Argon2id &bull; RBAC Active</span>
        </div>
      </footer>
    </div>
  );
}
