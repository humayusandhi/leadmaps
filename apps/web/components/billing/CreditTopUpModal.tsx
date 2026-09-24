'use client';

import * as React from 'react';
import { X, Zap, Check, Sparkles, ArrowRight } from 'lucide-react';

interface CreditTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (pack: 'pack_100' | 'pack_500' | 'pack_2000') => Promise<void> | void;
}

const TOPUP_PACKS = [
  {
    id: 'pack_100' as const,
    credits: 100,
    price: 499,
    perCredit: '₹4.99 / credit',
    label: 'Micro Pack',
  },
  {
    id: 'pack_500' as const,
    credits: 500,
    price: 1999,
    perCredit: '₹3.99 / credit',
    label: 'Standard Pack',
    popular: true,
  },
  {
    id: 'pack_2000' as const,
    credits: 2000,
    price: 6499,
    perCredit: '₹3.24 / credit',
    label: 'Growth Pack',
  },
];

export function CreditTopUpModal({ isOpen, onClose, onPurchase }: CreditTopUpModalProps) {
  const [selectedPack, setSelectedPack] = React.useState<'pack_100' | 'pack_500' | 'pack_2000'>('pack_500');
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onPurchase(selectedPack);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#0E1015] border border-white/[0.08] shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Top-Up Usage Credits</h2>
              <p className="text-xs text-slate-400">One-time credit packs with lifetime rollover validity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {TOPUP_PACKS.map((pack) => {
              const isSelected = selectedPack === pack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPack(pack.id)}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-white/20'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white font-mono">
                          +{pack.credits.toLocaleString()} Credits
                        </span>
                        {pack.popular && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Best Value
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {pack.perCredit}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-white font-mono">
                      ₹{pack.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">Instant delivery</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secure Payment Guarantee */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Powered by Razorpay Secure</span>
            <span className="text-emerald-400">UPI &bull; Cards &bull; NetBanking</span>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Complete Purchase
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
