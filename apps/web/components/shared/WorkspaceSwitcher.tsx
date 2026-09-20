'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentName = activeWorkspace?.name || 'My Workspace';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-xs font-sans text-slate-200 transition-all cursor-pointer select-none active:scale-[0.98]"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-medium max-w-[120px] truncate text-slate-200">{currentName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#181B22] border border-white/[0.12] shadow-2xl py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
            Workspaces ({workspaces.length})
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {workspaces.map((workspace) => {
              const isSelected = activeWorkspace?.id === workspace.id;
              return (
                <button
                  key={workspace.id}
                  onClick={() => {
                    switchWorkspace(workspace.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-300 font-medium'
                      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{workspace.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/[0.06] pt-1 mt-1 px-1">
            <button
              onClick={() => {
                setIsOpen(false);
                // Could open create workspace modal
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-sans text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
