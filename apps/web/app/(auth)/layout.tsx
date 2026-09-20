import * as React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full bg-[#090A0D] text-slate-100 flex flex-col justify-between items-center px-4 py-8 relative overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Auth Header / Brand Logo */}
      <header className="w-full max-w-md flex justify-center py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.18] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-sans font-bold text-base tracking-tight text-white">
            LeadMap <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">AI</span>
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md my-auto py-6">
        {children}
      </main>

      {/* Auth Footer */}
      <footer className="w-full max-w-md text-center text-xs font-mono text-slate-500 py-4">
        &copy; {new Date().getFullYear()} LeadMap AI. High-precision sales intelligence.
      </footer>
    </div>
  );
}
