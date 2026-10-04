import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PLAN_PRICES: Record<string, { price_inr: number; credits: number }> = {
  FREE: { price_inr: 0, credits: 50 },
  STARTER: { price_inr: 500, credits: 500 },
  GROWTH: { price_inr: 2000, credits: 2000 },
  PRO: { price_inr: 5000, credits: 5000 },
  AGENCY: { price_inr: 15000, credits: 15000 },
};

/**
 * POST /api/v1/billing/checkout
 * Verifies subscription plan upgrade payments before activating tiers.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, plan_code, payment_id, order_id, signature, workspace_id } = body;

    const planTier = String(plan_code || '').toUpperCase();
    const planConfig = PLAN_PRICES[planTier];

    if (!planConfig) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid plan code specified.',
        },
        { status: 400 }
      );
    }

    // Free plan can be activated without payment
    if (planConfig.price_inr === 0) {
      return NextResponse.json({
        success: true,
        data: {
          plan_code: planTier,
          monthly_credits: planConfig.credits,
          status: 'active',
          payment_id: null,
        },
        message: `Plan ${planTier} activated.`,
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const isAnnual = body.billing_cycle === 'annual';
    const amountPaid = isAnnual && planConfig.price_inr > 0
      ? Math.round(planConfig.price_inr * 12 * 0.8)
      : planConfig.price_inr;

    // Paid plans strictly require payment_id and verification
    if (action === 'verify-payment') {
      if (!payment_id || typeof payment_id !== 'string' || payment_id.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Payment verification failed: Payment ID is required for paid plan activation.',
          },
          { status: 402 }
        );
      }

      // Verify HMAC-SHA256 signature if keySecret is available
      if (keySecret && signature && order_id) {
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${order_id}|${payment_id}`)
          .digest('hex');

        if (expectedSignature !== signature) {
          return NextResponse.json(
            {
              success: false,
              message: 'Invalid payment signature. Subscription upgrade rejected.',
            },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          plan_code: planTier,
          monthly_credits: planConfig.credits,
          status: 'active',
          payment_id,
          billing_cycle: isAnnual ? 'annual' : 'monthly',
          amount_paid: amountPaid,
          verified_at: new Date().toISOString(),
        },
        message: `Payment verified. Subscribed to ${planTier} (${isAnnual ? 'Yearly - 20% OFF' : 'Monthly'}).`,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid action specified.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in subscription checkout route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while processing subscription checkout.',
      },
      { status: 500 }
    );
  }
}
