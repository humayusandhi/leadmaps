'use client';

import * as React from 'react';
import Link from 'next/link';
import { DoubleBezelCard } from '@/components/ui/double-bezel-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate / trigger reset dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Reset Password
        </h1>
        <p className="text-sm text-slate-400 font-sans">
          Enter your work email to receive access instructions
        </p>
      </div>

      {/* Auth Card */}
      <DoubleBezelCard innerClassName="p-6 md:p-8 space-y-6">
        {isSubmitted ? (
          <div className="space-y-5 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white font-sans">
                Check your inbox
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                If an account exists for <span className="text-slate-200 font-mono">{email}</span>, you will receive a secure password reset link shortly.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 pt-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              id="reset-email"
              placeholder="operator@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              required
              helperText="We will send a one-time reset token valid for 30 minutes"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center"
                withTrailingIcon
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        )}
      </DoubleBezelCard>

      {/* Switch to Login */}
      {!isSubmitted && (
        <div className="text-center text-xs text-slate-400 font-sans">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
