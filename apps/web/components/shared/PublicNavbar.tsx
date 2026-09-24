'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Compass,
  Layers,
  Sparkles,
  CreditCard,
  BookOpen,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface PublicNavbarProps {
  currentSection?: string;
}

export function PublicNavbar({ currentSection }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { label: 'Intelligence', href: '/intelligence', anchor: '#features', icon: Sparkles },
    { label: 'Cockpit', href: '/cockpit', anchor: '#cockpit', icon: Layers },
    { label: 'Finder', href: '/finder', anchor: '/finder', icon: Compass },
    { label: 'Pricing', href: '/pricing', anchor: '#pricing', icon: CreditCard },
    { label: 'Documentation', href: '/docs', anchor: '#docs', icon: BookOpen },
  ];

  const isHome = pathname === '/';

  return (
    <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 w-full">
      <nav className="flex items-center justify-between px-5 sm:px-6 py-2.5 rounded-full bg-[#111318]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 select-none group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
            LM
          </div>
          <span className="font-semibold tracking-tight text-white text-base">
            LeadMap<span className="text-emerald-400 font-mono text-sm">.ai</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/finder' && (pathname === '/finder' || pathname === '/discovery')) ||
              (isHome && item.anchor.startsWith('#') && currentSection === item.anchor.replace('#', ''));
            const destination = isHome && item.anchor.startsWith('#') ? item.anchor : item.href;

            return (
              <Link
                key={item.label}
                href={destination}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'text-white bg-white/[0.08] border border-white/[0.12] shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/finder">
            <Button
              variant="primary"
              size="sm"
              withTrailingIcon
              className="text-xs font-mono font-medium shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              Launch Console
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.08]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl bg-[#111318]/95 backdrop-blur-2xl border border-white/[0.1] shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={isHome && item.anchor.startsWith('#') ? item.anchor : item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/finder" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="sm" className="w-full text-xs">
                Launch
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
