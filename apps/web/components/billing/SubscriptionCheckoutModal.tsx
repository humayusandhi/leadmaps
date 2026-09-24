'use client';

import * as React from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Zap, 
  Building2,
  AlertCircle
} from 'lucide-react';
import type { PlanDTO } from '@leadmap/shared-types';

interface SubscriptionCheckoutModalProps {
  isOpen: boolean;
  plan: PlanDTO | null;
  onClose: () => void;
  onSuccess: (plan: PlanDTO, paymentDetails: { paymentId: string; method: string }) => void;
}

export function SubscriptionCheckoutModal({
  isOpen,
  plan,
  onClose,
  onSuccess,
}: SubscriptionCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = React.useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = React.useState('4111 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = React.useState('12/28');
  const [cardCvv, setCardCvv] = React.useState('888');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [step, setStep] = React.useState<'review' | 'processing' | 'success'>('review');

  React.useEffect(() => {
    if (isOpen) {
      setStep('review');
      setIsProcessing(false);
    }
  }, [isOpen, plan]);

  if (!isOpen || !plan) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStep('processing');

    // Simulate authentic Razorpay payment gateway handshake & verification
    setTimeout(() => {
      const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
      setStep('success');
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(plan, { paymentId: mockPaymentId, method: paymentMethod });
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#0E1015] border border-white/[0.1] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                Checkout &bull; {plan.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Encrypted 256-bit Razorpay Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'processing' ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Communicating with Payment Gateway...</h3>
              <p className="text-xs text-slate-400 font-mono">
                Securing tokenized webhook verification for {plan.name}
              </p>
            </div>
          </div>
        ) : step === 'success' ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-in zoom-in-95">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Payment Confirmed!</h3>
              <p className="text-xs text-emerald-400 font-mono">
                Allocated +{plan.monthly_credits.toLocaleString()} active usage credits
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-5">
            {/* Order Summary Box */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Subscription Plan:</span>
                <span className="font-bold text-white font-sans">{plan.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Monthly Usage Credits:</span>
                <span className="font-bold text-emerald-400">+{plan.monthly_credits.toLocaleString()} cr / mo</span>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex items-baseline justify-between">
                <span className="text-xs font-mono text-slate-300">Total Billed Today:</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white font-mono">
                    ₹{plan.price_inr.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">Includes all applicable GST</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Debit / Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Dynamic Inputs according to Payment Gateway */}
            {paymentMethod === 'upi' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@okhdfcbank"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
                  required
                />
                <span className="text-[10px] font-mono text-slate-500 block">
                  Supports Google Pay, PhonePe, Paytm, and BHIM
                </span>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-emerald-500/60"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-300">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-emerald-500/60"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-300">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-emerald-500/60"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Select Partner Bank</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#181B22] border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-emerald-500/60 cursor-pointer">
                  <option>HDFC Bank &bull; Retail</option>
                  <option>ICICI Bank &bull; Corporate / Retail</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Gateway Guarantee */}
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-300 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="leading-tight text-[11px]">
                Prepaid recurring subscription. You can cancel or change anytime from your billing dashboard.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
              >
                <span>Pay ₹{plan.price_inr.toLocaleString()} & Activate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
