import { NextResponse } from 'next/server';

interface UserStore {
  id: string;
  name: string;
  email: string;
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

const globalRegistry = globalThis as unknown as {
  __leadmap_users?: Map<string, UserStore>;
  __leadmap_workspaces?: Map<string, WorkspaceStore>;
  __leadmap_sessions?: Map<string, { userId: string; workspaceId: string }>;
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthenticated.',
      },
      { status: 401 }
    );
  }

  const session = globalRegistry.__leadmap_sessions?.get(token);
  let user: UserStore | undefined;
  let workspace: WorkspaceStore | undefined;

  if (session) {
    user = Array.from(globalRegistry.__leadmap_users?.values() || []).find(
      (u) => u.id === session.userId
    );
    workspace = globalRegistry.__leadmap_workspaces?.get(session.workspaceId);
  }

  // Fallback demo user if token exists
  if (!user) {
    user = {
      id: 'usr_default_pilot',
      name: 'Pilot Operator',
      email: 'operator@leadmap.ai',
      created_at: new Date().toISOString(),
    };
  }

  if (!workspace) {
    workspace = {
      id: 'wsp_default_primary',
      name: 'Primary Agency',
      slug: 'primary-agency',
      tier: 'FREE',
      credit_balance: 25,
      created_at: new Date().toISOString(),
    };
  }

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified_at: null,
        created_at: user.created_at,
      },
      workspaces: [
        {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          tier: workspace.tier,
          credit_balance: workspace.credit_balance,
          role: 'OWNER',
          created_at: workspace.created_at,
        },
      ],
    },
    message: 'Profile retrieved successfully.',
  });
}
