'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DoubleBezelCard } from '@/components/ui/double-bezel-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Sparkles, Zap } from 'lucide-react';

const PLAN_INFO: Record<string, { name: string; credits: number }> = {
  free: { name: 'Free Explorer', credits: 50 },
  starter: { name: 'Starter Prospector', credits: 500 },
  growth: { name: 'Growth Agency', credits: 2000 },
  scale: { name: 'Scale Enterprise', credits: 6000 },
  pro: { name: 'Pro Enterprise', credits: 5000 },
  agency: { name: 'Agency High-Volume', credits: 15000 },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan')?.toLowerCase() || 'free';
  const selectedPlanInfo = PLAN_INFO[planParam] || PLAN_INFO.free;

  const { user, register, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [workspaceName, setWorkspaceName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace('/dashboard');
    }
  }, [isAuthLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await register(name, email, password, workspaceName.trim() || undefined, planParam);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please check your information and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Create Your Account
        </h1>
        <p className="text-sm text-slate-400 font-sans">
          Start uncovering high-value local business opportunities
        </p>
      </div>

      {/* Auth Card */}
      <DoubleBezelCard innerClassName="p-6 md:p-8 space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-300 font-sans leading-relaxed">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            id="register-name"
            placeholder="Alex Mercer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            autoComplete="name"
            required
          />

          <Input
            label="Work Email"
            type="email"
            id="register-email"
            placeholder="alex@merceragency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type="password"
            id="register-password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            required
            helperText="Must be at least 8 characters long"
          />

          <Input
            label="Agency / Workspace Name"
            type="text"
            id="register-workspace"
            placeholder="Mercer Digital (Optional)"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            disabled={isSubmitting}
            helperText="You can invite team members and add more workspaces later"
          />

          {/* Selected Plan & Credit Quota Badge */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Selected Plan</span>
                <span className="font-bold text-white font-sans">{selectedPlanInfo.name}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Active Credits</span>
              <span className="font-bold text-emerald-400">+{selectedPlanInfo.credits.toLocaleString()} cr</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              withTrailingIcon
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Provisioning Workspace...'
                : planParam === 'free'
                ? 'Launch Free Account (50 Credits)'
                : `Activate ${selectedPlanInfo.name} (${selectedPlanInfo.credits.toLocaleString()} Credits)`}
            </Button>
          </div>
        </form>
      </DoubleBezelCard>

      {/* Switch to Login */}
      <div className="text-center text-xs text-slate-400 font-sans">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="w-full h-80 rounded-2xl bg-white/[0.02] border border-white/[0.08] animate-pulse flex items-center justify-center">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Loading Workspace Portal...
          </span>
        </div>
      }
    >
      <RegisterForm />
    </React.Suspense>
  );
}
