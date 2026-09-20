'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DoubleBezelCard } from '@/components/ui/double-bezel-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
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
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid credentials or authentication failure.');
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
          Welcome Back
        </h1>
        <p className="text-sm text-slate-400 font-sans">
          Sign in to your sales intelligence cockpit
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
          <div className="space-y-1">
            <Input
              label="Work Email"
              type="email"
              id="login-email"
              placeholder="operator@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-xs font-mono font-medium text-slate-300 tracking-wider uppercase"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-sans"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              id="login-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="current-password"
              required
            />
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
              {isSubmitting ? 'Verifying Credentials...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </DoubleBezelCard>

      {/* Switch to Register */}
      <div className="text-center text-xs text-slate-400 font-sans">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
