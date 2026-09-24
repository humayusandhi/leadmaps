import { NextResponse } from 'next/server';

interface UserStore {
  id: string;
  name: string;
  email: string;
  password?: string;
  created_at: string;
}

interface WorkspaceStore {
  id: string;
  name: string;
  slug: string;
  tier: 'FREE' | 'STARTER' | 'GROWTH' | 'PRO' | 'AGENCY';
  credit_balance: number;
  created_at: string;
}

// In-memory registry for local/demo server runtime
const globalRegistry = globalThis as unknown as {
  __leadmap_users?: Map<string, UserStore>;
  __leadmap_workspaces?: Map<string, WorkspaceStore>;
  __leadmap_sessions?: Map<string, { userId: string; workspaceId: string }>;
};

if (!globalRegistry.__leadmap_users) {
  globalRegistry.__leadmap_users = new Map();
}
if (!globalRegistry.__leadmap_workspaces) {
  globalRegistry.__leadmap_workspaces = new Map();
}
if (!globalRegistry.__leadmap_sessions) {
  globalRegistry.__leadmap_sessions = new Map();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, workspace_name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'The name field is required.',
          errors: { name: ['The name field is required.'] },
        },
        { status: 422 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          message: 'A valid email address is required.',
          errors: { email: ['A valid email address is required.'] },
        },
        { status: 422 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'The password must be at least 8 characters.',
          errors: { password: ['The password must be at least 8 characters.'] },
        },
        { status: 422 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    // Generate IDs
    const userId = `usr_${Math.random().toString(36).substring(2, 12)}`;
    const user: UserStore = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      created_at: now,
    };

    const requestedPlan = (body.plan?.toUpperCase() || 'FREE') as 'FREE' | 'STARTER' | 'GROWTH' | 'PRO' | 'AGENCY';
    const planCreditsMap: Record<string, number> = {
      FREE: 50,
      STARTER: 500,
      GROWTH: 2000,
      SCALE: 6000,
      PRO: 5000,
      AGENCY: 15000,
    };
    const initialCredits = planCreditsMap[requestedPlan] || 50;

    const wName = workspace_name?.trim() || `${name.trim()}'s Workspace`;
    const wSlug = `${wName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
    const workspaceId = `wsp_${Math.random().toString(36).substring(2, 12)}`;
    const workspace: WorkspaceStore = {
      id: workspaceId,
      name: wName,
      slug: wSlug,
      tier: ['FREE', 'STARTER', 'GROWTH', 'PRO', 'AGENCY'].includes(requestedPlan) ? requestedPlan : 'FREE',
      credit_balance: initialCredits,
      created_at: now,
    };

    const token = `1|leadmap_token_${Math.random().toString(36).substring(2)}${Date.now()}`;

    // Store in global memory
    globalRegistry.__leadmap_users!.set(normalizedEmail, user);
    globalRegistry.__leadmap_workspaces!.set(workspaceId, workspace);
    globalRegistry.__leadmap_sessions!.set(token, { userId, workspaceId });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            email_verified_at: null,
            created_at: user.created_at,
          },
          workspace: {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            tier: workspace.tier,
            credit_balance: workspace.credit_balance,
            role: 'OWNER',
            created_at: workspace.created_at,
          },
          token,
        },
        message: 'User registered successfully with default workspace.',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Registration failed. Please check your information and try again.',
      },
      { status: 500 }
    );
  }
}
