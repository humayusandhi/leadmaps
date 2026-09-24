'use client';

import * as React from 'react';
import { OutreachChannel, AiOutreachDraftDTO } from '@leadmap/shared-types';
import { Mail, MessageCircle, Linkedin } from 'lucide-react';

interface ChannelDraftTabProps {
  activeChannel: OutreachChannel;
  channel: OutreachChannel;
  draft?: AiOutreachDraftDTO;
  onClick: (channel: OutreachChannel) => void;
}

export function ChannelDraftTab({ activeChannel, channel, draft, onClick }: ChannelDraftTabProps) {
  const isActive = activeChannel === channel;

  const icon = channel === 'email' ? (
    <Mail className="w-4 h-4" />
  ) : channel === 'whatsapp' ? (
    <MessageCircle className="w-4 h-4" />
  ) : (
    <Linkedin className="w-4 h-4" />
  );

  const label = channel === 'email' ? 'Email Cold Pitch' : channel === 'whatsapp' ? 'WhatsApp Direct' : 'LinkedIn InMail';

  return (
    <button
      type="button"
      onClick={() => onClick(channel)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium font-mono tracking-tight transition-all ${
        isActive
          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      {icon}
      <span>{label}</span>
      {channel === 'whatsapp' && (
        <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
          &le;400c
        </span>
      )}
    </button>
  );
}
