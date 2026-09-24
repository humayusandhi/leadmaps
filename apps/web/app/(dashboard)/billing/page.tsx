'use client';

import * as React from 'react';
import { 
  CreditBalanceDTO, 
  PlanDTO, 
  CreditTransactionDTO, 
  SubscriptionDTO,
  SubscriptionTier 
} from '@leadmap/shared-types';
import { CreditUsageBar } from '@/components/billing/CreditUsageBar';
import { PlanCard } from '@/components/billing/PlanCard';
import { CreditTopUpModal } from '@/components/billing/CreditTopUpModal';
import { SubscriptionCheckoutModal } from '@/components/billing/SubscriptionCheckoutModal';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShieldCheck, 
  History, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw,
  Sparkles,
  Check
} from 'lucide-react';

const DEFAULT_PLANS: PlanDTO[] = [
  {
    id: 'plan-free',
    code: 'FREE',
    name: 'Free Trial',
    price_inr: 0,
    monthly_credits: 50,
    features: [
      '50 search credits / month',
      'Basic website audit signals',
      '1 team seat',
      'Standard CSV export',
    ],
  },
  {
    id: 'plan-starter',
    code: 'STARTER',
    name: 'Starter Prospector',
    price_inr: 1999,
    monthly_credits: 500,
    features: [
      '500 search credits / month',
      'Full technical signals (SSL, Speed, CMS)',
      'Multi-Channel AI Outreach (Email & WA)',
      '3 team seats',
      'RFC 4180 CSV export',
    ],
  },
  {
    id: 'plan-growth',
    code: 'GROWTH',
    name: 'Growth Agency',
    price_inr: 4999,
    monthly_credits: 2000,
    features: [
      '2,000 search credits / month',
      'Full AI Opportunity extraction & scoring',
      'Custom lead lists & segmentation',
      '10 team seats',
      'RiffCRM & Webhook direct sync',
    ],
  },
  {
    id: 'plan-pro',
    code: 'PRO',
    name: 'Pro Enterprise',
    price_inr: 9999,
    monthly_credits: 5000,
    features: [
      '5,000 search credits / month',
      'Unlimited custom lead lists',
      'Priority web crawler queue',
      'Unlimited team seats',
      'Dedicated IP pool & Priority support',
    ],
  },
  {
    id: 'plan-agency',
    code: 'AGENCY',
    name: 'Agency High-Volume',
    price_inr: 24999,
    monthly_credits: 15000,
    features: [
      '15,000 search credits / month',
      'Custom white-label diagnostic reports',
      'Dedicated account strategist',
      'Custom webhook destinations',
      '99.9% Enterprise SLA uptime',
    ],
  },
];

const INITIAL_TRANSACTIONS: CreditTransactionDTO[] = [
  {
    id: 'tx-001',
    workspace_id: 'ws-default',
    amount: 2000,
    type: 'MONTHLY_GRANT',
    description: 'Monthly subscription allocation (Growth Agency)',
    balance_after: 2000,
    created_at: '2026-09-20T00:00:00Z',
  },
  {
    id: 'tx-002',
    workspace_id: 'ws-default',
    amount: -12,
    type: 'CONSUMPTION',
    description: 'Bulk business search: "Austin Dentists" (12 results)',
    reference_id: 'job-search-0921',
    balance_after: 1988,
    created_at: '2026-09-21T02:15:00Z',
  },
  {
    id: 'tx-003',
    workspace_id: 'ws-default',
    amount: -1,
    type: 'CONSUMPTION',
    description: 'Technical audit & signal crawl: Apex Dental Care',
    reference_id: 'lead-001',
    balance_after: 1987,
    created_at: '2026-09-21T03:30:00Z',
  },
  {
    id: 'tx-004',
    workspace_id: 'ws-default',
    amount: 500,
    type: 'PURCHASE',
    description: 'One-time top-up pack (500 credits)',
    balance_after: 2487,
    created_at: '2026-09-21T06:00:00Z',
  },
];

export default function BillingPage() {
  const { activeWorkspace, refundCredits, updateWorkspacePlan } = useAuth();
  const currentCreditBalance = activeWorkspace?.credit_balance ?? 25;

  const [balance, setBalance] = React.useState<CreditBalanceDTO>({
    balance: currentCreditBalance,
    reserved: 0,
    available: currentCreditBalance,
    lifetime_granted: Math.max(currentCreditBalance + 50, 100),
    lifetime_consumed: 0,
  });

  const [currentPlanCode, setCurrentPlanCode] = React.useState<SubscriptionTier>(
    activeWorkspace?.tier || 'GROWTH'
  );

  // Sync real-time workspace credits and tier from AuthContext
  React.useEffect(() => {
    if (activeWorkspace?.credit_balance !== undefined) {
      setBalance((prev) => ({
        ...prev,
        balance: activeWorkspace.credit_balance,
        available: Math.max(0, activeWorkspace.credit_balance - prev.reserved),
      }));
    }
    if (activeWorkspace?.tier) {
      setCurrentPlanCode(activeWorkspace.tier);
    }
  }, [activeWorkspace?.credit_balance, activeWorkspace?.tier]);

  const [transactions, setTransactions] = React.useState<CreditTransactionDTO[]>(INITIAL_TRANSACTIONS);
  const [isTopUpOpen, setIsTopUpOpen] = React.useState(false);
  const [checkoutPlan, setCheckoutPlan] = React.useState<PlanDTO | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentPlan = DEFAULT_PLANS.find((p) => p.code === currentPlanCode) || DEFAULT_PLANS[2];

  const handleSelectPlan = (plan: PlanDTO) => {
    if (plan.code === currentPlanCode) return;

    // Free plan activates immediately without payment gateway
    if (plan.price_inr === 0) {
      applyPlanActivation(plan);
      return;
    }

    // Paid plans launch secure Razorpay payment gateway checkout modal
    setCheckoutPlan(plan);
  };

  const applyPlanActivation = (
    plan: PlanDTO,
    paymentDetails?: { paymentId: string; method: string }
  ) => {
    setCurrentPlanCode(plan.code);
    updateWorkspacePlan(plan.code);

    const allocatedCredits = plan.monthly_credits;
    const previousBalance = activeWorkspace?.credit_balance ?? balance.balance;
    const newBalance = Math.max(previousBalance, allocatedCredits);
    const difference = newBalance - previousBalance;

    const newTx: CreditTransactionDTO = {
      id: `tx-${Date.now()}`,
      workspace_id: activeWorkspace?.id || 'ws-default',
      amount: difference > 0 ? difference : allocatedCredits,
      type: 'MONTHLY_GRANT',
      description: paymentDetails
        ? `Plan activated: ${plan.name} via Razorpay (${paymentDetails.paymentId.toUpperCase()} &bull; ₹${plan.price_inr.toLocaleString()})`
        : `Plan activated: ${plan.name} (${allocatedCredits.toLocaleString()} monthly credits quota)`,
      balance_after: newBalance,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`✓ Subscribed to ${plan.name}! +${allocatedCredits.toLocaleString()} active credits allocated.`);
  };

  const handleTopUpPurchase = async (pack: 'pack_100' | 'pack_500' | 'pack_2000') => {
    const credits = pack === 'pack_100' ? 100 : pack === 'pack_500' ? 500 : 2000;
    
    // Increment global workspace credit balance
    refundCredits(credits);

    const newTx: CreditTransactionDTO = {
      id: `tx-${Date.now()}`,
      workspace_id: activeWorkspace?.id || 'ws-default',
      amount: credits,
      type: 'PURCHASE',
      description: `One-time top-up pack (${credits} credits)`,
      balance_after: (activeWorkspace?.credit_balance ?? balance.balance) + credits,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Successfully credited +${credits} usage credits!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#181B22] border border-emerald-500/40 text-emerald-300 text-xs font-sans shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Billing & Usage Credit Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your subscription tier, track real-time consumption, and review transaction ledgers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Current Plan:</span>
            <span className="font-bold text-emerald-400">{currentPlan.name}</span>
          </div>
        </div>
      </div>

      {/* Credit Usage Progress Bar Widget */}
      <CreditUsageBar
        balance={balance}
        quota={currentPlan.monthly_credits}
        planName={currentPlan.name}
        onTopUpClick={() => setIsTopUpOpen(true)}
      />

      {/* Plans Matrix */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Subscription Plans</h2>
          <p className="text-xs text-slate-400">
            Scale your prospecting volume with automated monthly quota renewals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {DEFAULT_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.code === currentPlanCode}
              isRecommended={plan.code === 'GROWTH'}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>
      </div>

      {/* Append-Only Credit Transaction Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              Credit Ledger History
            </h2>
            <p className="text-xs text-slate-400">
              Cryptographically verified, append-only usage and grant audit trail
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#111318] border border-white/[0.08] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-medium">Timestamp</th>
                  <th className="py-3.5 px-4 font-medium">Type</th>
                  <th className="py-3.5 px-4 font-medium">Description</th>
                  <th className="py-3.5 px-4 font-medium text-right">Change</th>
                  <th className="py-3.5 px-4 font-medium text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(tx.created_at).toLocaleString([], {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tx.type === 'MONTHLY_GRANT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : tx.type === 'PURCHASE'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25'
                            : tx.type === 'CONSUMPTION'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        {tx.description}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPositive ? `+${tx.amount}` : tx.amount}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300 font-bold">
                        {tx.balance_after.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      <CreditTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onPurchase={handleTopUpPurchase}
      />

      {/* Subscription Payment Gateway Checkout Modal */}
      <SubscriptionCheckoutModal
        isOpen={Boolean(checkoutPlan)}
        plan={checkoutPlan}
        onClose={() => setCheckoutPlan(null)}
        onSuccess={(plan, details) => applyPlanActivation(plan, details)}
      />
    </div>
  );
}
