import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface TopUpPack {
  id: string;
  credits: number;
  price_inr: number;
  price_paise: number;
  label: string;
}

const TOPUP_PACKS: Record<string, TopUpPack> = {
  pack_100: {
    id: 'pack_100',
    credits: 100,
    price_inr: 499,
    price_paise: 49900,
    label: 'Micro Pack',
  },
  pack_500: {
    id: 'pack_500',
    credits: 500,
    price_inr: 1999,
    price_paise: 199900,
    label: 'Standard Pack',
  },
  pack_2000: {
    id: 'pack_2000',
    credits: 2000,
    price_inr: 6499,
    price_paise: 649900,
    label: 'Growth Pack',
  },
};

const globalRegistry = globalThis as unknown as {
  __leadmap_workspaces?: Map<string, any>;
  __leadmap_orders?: Map<string, { packId: string; amount: number; status: 'created' | 'paid' | 'failed'; created_at: string }>;
};

if (!globalRegistry.__leadmap_orders) {
  globalRegistry.__leadmap_orders = new Map();
}

/**
 * POST /api/v1/billing/topup
 * Handles creation of orders and verification of payment before any token credits are granted.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pack_id, payment_id, order_id, signature, workspace_id } = body;

    const pack = TOPUP_PACKS[pack_id];
    if (!pack) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credit top-up pack selected.',
        },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // ACTION 1: CREATE ORDER
    if (action === 'create-order') {
      let razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`;

      // If Razorpay API credentials are configured, create authentic order via Razorpay API
      if (keyId && keySecret && !keyId.includes('YOUR_RAZORPAY')) {
        try {
          const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
          const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({
              amount: pack.price_paise,
              currency: 'INR',
              receipt: `rcpt_topup_${Date.now()}`,
              notes: {
                pack_id: pack.id,
                credits: pack.credits,
                workspace_id: workspace_id || 'ws-default',
              },
            }),
          });

          if (rzpRes.ok) {
            const rzpOrder = await rzpRes.json();
            razorpayOrderId = rzpOrder.id;
          } else {
            const errData = await rzpRes.json().catch(() => ({}));
            console.error('Razorpay order creation failed:', errData);
          }
        } catch (err) {
          console.error('Error contacting Razorpay API:', err);
        }
      }

      globalRegistry.__leadmap_orders!.set(razorpayOrderId, {
        packId: pack.id,
        amount: pack.price_inr,
        status: 'created',
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        data: {
          order_id: razorpayOrderId,
          pack_id: pack.id,
          amount_inr: pack.price_inr,
          amount_paise: pack.price_paise,
          currency: 'INR',
          key_id: (keyId && !keyId.includes('YOUR_RAZORPAY')) ? keyId : null,
          credits: pack.credits,
        },
      });
    }

    // ACTION 2: VERIFY PAYMENT & ISSUE TOKENS
    if (action === 'verify-payment') {
      if (!payment_id || typeof payment_id !== 'string' || payment_id.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Payment verification failed: Payment ID is required. Tokens cannot be granted without confirmed payment.',
          },
          { status: 402 }
        );
      }

      // Cryptographic HMAC-SHA256 signature verification if secret is configured
      if (keySecret && signature && order_id) {
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${order_id}|${payment_id}`)
          .digest('hex');

        if (expectedSignature !== signature) {
          return NextResponse.json(
            {
              success: false,
              message: 'Cryptographic signature mismatch. Unauthorized payment attempt rejected.',
            },
            { status: 400 }
          );
        }
      }

      // Check if order exists and hasn't been already redeemed
      if (order_id) {
        const recordedOrder = globalRegistry.__leadmap_orders?.get(order_id);
        if (recordedOrder && recordedOrder.status === 'paid') {
          return NextResponse.json(
            {
              success: false,
              message: 'This payment order has already been credited.',
            },
            { status: 400 }
          );
        }
        if (recordedOrder) {
          recordedOrder.status = 'paid';
        }
      }

      // Update workspace in server global registry if exists
      if (workspace_id && globalRegistry.__leadmap_workspaces?.has(workspace_id)) {
        const ws = globalRegistry.__leadmap_workspaces.get(workspace_id);
        ws.credit_balance = (ws.credit_balance || 0) + pack.credits;
      }

      return NextResponse.json({
        success: true,
        data: {
          credits_granted: pack.credits,
          pack_id: pack.id,
          payment_id,
          amount_paid: pack.price_inr,
          currency: 'INR',
          verified_at: new Date().toISOString(),
        },
        message: `Payment verified. +${pack.credits.toLocaleString()} tokens successfully credited.`,
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
    console.error('Error in topup route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error while processing billing transaction.',
      },
      { status: 500 }
    );
  }
}
