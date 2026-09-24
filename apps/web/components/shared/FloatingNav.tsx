'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import {
  Compass,
  LayoutDashboard,
  MapPin,
  ListFilter,
  Layers,
  CreditCard,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  Share2,
  ShieldAlert,
} from 'lucide-react';

export function FloatingNav() {
  const pathname = usePathname();
  const { user, activeWorkspace, logout } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  // Close profile on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if current user has super admin privileges
  const isSuperAdmin =
    user?.email?.toLowerCase().includes('admin') ||
    user?.email?.toLowerCase() === 'operator@leadmap.ai';

  const baseNavLinks = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Finder', href: '/finder', icon: MapPin },
    { label: 'Pipeline', href: '/pipeline', icon: ListFilter },
    { label: 'Lists', href: '/lists', icon: Layers },
    { label: 'Integrations', href: '/integrations', icon: Share2 },
    { label: 'Billing', href: '/billing', icon: CreditCard },
  ];

  const navLinks = isSuperAdmin
    ? [...baseNavLinks, { label: 'Super Admin', href: '/admin', icon: ShieldAlert }]
    : baseNavLinks;

  return (
    <nav className="sticky top-4 z-40 mx-auto max-w-6xl w-[calc(100%-2rem)] rounded-full bg-[#111318]/85 backdrop-blur-xl border border-white/[0.08] px-4 sm:px-6 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Brand & Workspace */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 select-none group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center transition-transform group-hover:scale-105">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-sans font-bold text-sm tracking-tight text-white hidden md:inline-flex items-center gap-1.5">
              LeadMap
              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                AI
              </span>
            </span>
          </Link>

          <div className="h-4 w-[1px] bg-white/[0.1] hidden sm:block" />

          <WorkspaceSwitcher />
        </div>

        {/* Center Section: Primary Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/finder' && (pathname === '/finder' || pathname === '/discovery'));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-medium border border-white/[0.1] shadow-inner-bezel'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Section: Credit Ticker & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Credit Ticker Badge */}
          <Link
            href="/billing"
            title={`Active Plan: ${activeWorkspace?.tier || 'FREE'} — Click to manage credits`}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 select-none transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold text-emerald-400 text-[10px] uppercase tracking-wider hidden sm:inline">
              {activeWorkspace?.tier || 'FREE'}
            </span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="font-medium text-slate-200">
              {activeWorkspace?.credit_balance !== undefined
                ? activeWorkspace.credit_balance.toLocaleString()
                : '25'}
            </span>
            <span className="text-[10px] text-slate-500 uppercase">cr</span>
          </Link>

          {/* User Profile Popover Trigger */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center text-xs font-mono font-medium text-slate-200 transition-all cursor-pointer select-none active:scale-[0.98]"
              aria-expanded={profileOpen}
              title={user?.email || 'User Profile'}
            >
              {user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-3.5 h-3.5 text-slate-300" />
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#181B22] border border-white/[0.12] shadow-2xl py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-white/[0.06]">
                  <p className="text-xs font-medium text-white truncate font-sans">
                    {user?.name || 'Operator'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate font-mono">
                    {user?.email || 'operator@leadmap.ai'}
                  </p>
                </div>

                <div className="py-1">
                  <div className="px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Plan Tier:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      {activeWorkspace?.tier || 'FREE'}
                    </span>
                  </div>

                  {isSuperAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-mono"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Super Admin Plane</span>
                    </Link>
                  )}
                </div>

                <div className="border-t border-white/[0.06] pt-1 mt-1 px-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-sans text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/[0.08] flex flex-col gap-1 pb-1">
          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/finder' && (pathname === '/finder' || pathname === '/discovery'));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
