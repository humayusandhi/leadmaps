<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Billing\Contracts\PaymentProviderInterface;
use App\Domain\Billing\Models\Plan;
use App\Domain\Billing\Models\Subscription;
use App\Domain\Usage\Models\CreditTransaction;
use App\Domain\Usage\Services\CreditEngineService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class BillingController extends Controller
{
    /**
     * Get live credit balance summary and active subscription.
     */
    public function balance(Request $request, CreditEngineService $creditEngine): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $summary = $creditEngine->getBalanceSummary($workspaceId);

        $subscription = Subscription::with('plan')
            ->where('workspace_id', $workspaceId)
            ->whereIn('status', ['active', 'authenticated'])
            ->latest()
            ->first();

        return ApiResponse::success(data: [
            'balance' => $summary['balance'],
            'reserved' => $summary['reserved'],
            'available' => $summary['available'],
            'lifetime_granted' => $summary['lifetime_granted'],
            'lifetime_consumed' => $summary['lifetime_consumed'],
            'subscription' => $subscription,
            'current_plan' => $subscription?->plan ?? [
                'code' => 'FREE',
                'name' => 'Free Trial',
                'price_inr' => 0,
                'monthly_credits' => 50,
            ],
        ]);
    }

    /**
     * List all available subscription plans.
     */
    public function plans(): JsonResponse
    {
        $plans = Plan::where('is_active', true)->orderBy('price_inr', 'asc')->get();

        if ($plans->isEmpty()) {
            // Seed fallback plan matrix if empty
            $plans = collect([
                [
                    'id' => 'plan-free',
                    'code' => 'FREE',
                    'name' => 'Free Community',
                    'price_inr' => 0,
                    'monthly_credits' => 50,
                    'features' => ['50 search credits/mo', 'Basic website audit', 'Single user seat', 'Standard export'],
                ],
                [
                    'id' => 'plan-starter',
                    'code' => 'STARTER',
                    'name' => 'Starter Prospector',
                    'price_inr' => 1999,
                    'monthly_credits' => 500,
                    'features' => ['500 search credits/mo', 'Full technical signals (SSL, Speed, CMS)', 'AI Outreach generator (Email & WA)', '3 user seats', 'RFC 4180 CSV export'],
                ],
                [
                    'id' => 'plan-growth',
                    'code' => 'GROWTH',
                    'name' => 'Growth Agency',
                    'price_inr' => 4999,
                    'monthly_credits' => 2000,
                    'features' => ['2,000 search credits/mo', 'Full AI Opportunity synthesis & scoring', 'Custom lead lists segmentation', '10 team seats', 'RiffCRM & Webhook direct sync'],
                ],
                [
                    'id' => 'plan-pro',
                    'code' => 'PRO',
                    'name' => 'Pro Enterprise',
                    'price_inr' => 9999,
                    'monthly_credits' => 5000,
                    'features' => ['5,000 search credits/mo', 'Unlimited custom lists', 'Highest priority crawling queue', 'Unlimited team seats', 'Dedicated IP pool & Priority support'],
                ],
                [
                    'id' => 'plan-agency',
                    'code' => 'AGENCY',
                    'name' => 'Agency High-Volume',
                    'price_inr' => 24999,
                    'monthly_credits' => 15000,
                    'features' => ['15,000 search credits/mo', 'Custom white-label reports', 'Custom web crawlers & scrapers', 'Dedicated account manager', '99.9% SLA uptime agreement'],
                ],
            ]);
        }

        return ApiResponse::success(data: $plans);
    }

    /**
     * Create a Razorpay checkout session for subscription upgrade.
     */
    public function checkout(
        Request $request,
        PaymentProviderInterface $provider
    ): JsonResponse {
        $validated = $request->validate([
            'plan_code' => 'required|string|in:STARTER,GROWTH,PRO,AGENCY',
        ]);

        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;
        $userEmail = auth()->user()?->email ?? 'billing@customer.example.com';

        $session = $provider->createSubscription(
            planCode: $validated['plan_code'],
            customerEmail: $userEmail,
            metadata: ['workspace_id' => $workspaceId]
        );

        // Find plan or generate plan association
        $plan = Plan::where('code', strtoupper($validated['plan_code']))->first();

        // Create or update pending subscription
        Subscription::updateOrCreate(
            [
                'workspace_id' => $workspaceId,
                'status' => 'pending',
            ],
            [
                'id' => (string) Str::uuid(),
                'plan_id' => $plan?->id ?? '00000000-0000-0000-0000-000000000001',
                'provider' => 'razorpay',
                'provider_subscription_id' => $session['subscription_id'],
            ]
        );

        return ApiResponse::success(
            data: $session,
            message: 'Checkout session created successfully.'
        );
    }

    /**
     * Get paginated credit transaction ledger history.
     */
    public function transactions(Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $transactions = CreditTransaction::where('workspace_id', $workspaceId)
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return ApiResponse::success(data: $transactions);
    }

    /**
     * Top up credits with a one-time pack.
     */
    public function topup(Request $request, CreditEngineService $creditEngine): JsonResponse
    {
        $validated = $request->validate([
            'pack' => 'required|string|in:pack_100,pack_500,pack_2000',
        ]);

        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $credits = match ($validated['pack']) {
            'pack_100' => 100,
            'pack_500' => 500,
            'pack_2000' => 2000,
        };

        $tx = $creditEngine->grant(
            workspaceId: $workspaceId,
            amount: $credits,
            type: 'PURCHASE',
            description: "Credit top-up ({$credits} credits)"
        );

        return ApiResponse::success(
            data: [
                'transaction' => $tx,
                'new_balance' => $tx->balance_after,
            ],
            message: "Successfully added {$credits} credits to workspace."
        );
    }

    /**
     * Cancel an existing subscription.
     */
    public function cancel(Request $request, PaymentProviderInterface $provider): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $sub = Subscription::where('workspace_id', $workspaceId)
            ->where('status', 'active')
            ->first();

        if (! $sub) {
            return ApiResponse::error(
                message: 'No active subscription found to cancel.',
                statusCode: 404
            );
        }

        if ($sub->provider_subscription_id) {
            $provider->cancelSubscription($sub->provider_subscription_id);
        }

        $sub->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return ApiResponse::success(
            message: 'Subscription cancelled successfully. You can use your remaining credits through period end.'
        );
    }
}
