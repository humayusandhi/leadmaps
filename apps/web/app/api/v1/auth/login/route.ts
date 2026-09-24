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
    const { email, password } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid email is required.',
          errors: { email: ['Valid email is required.'] },
        },
        { status: 422 }
      );
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password is required.',
          errors: { password: ['Password is required.'] },
        },
        { status: 422 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = globalRegistry.__leadmap_users!.get(normalizedEmail);
    let workspaceId = '';
    let workspace: WorkspaceStore | undefined;

    if (!user) {
      // Auto-provision demo/local user if logging in for first time
      const nameParts = normalizedEmail.split('@')[0].split('.');
      const derivedName = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      const userId = `usr_${Math.random().toString(36).substring(2, 12)}`;
      user = {
        id: userId,
        name: derivedName || 'LeadMap User',
        email: normalizedEmail,
        created_at: new Date().toISOString(),
      };
      globalRegistry.__leadmap_users!.set(normalizedEmail, user);

      workspaceId = `wsp_${Math.random().toString(36).substring(2, 12)}`;
      workspace = {
        id: workspaceId,
        name: `${user.name}'s Workspace`,
        slug: `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-agency`,
        tier: 'FREE',
        credit_balance: 25,
        created_at: new Date().toISOString(),
      };
      globalRegistry.__leadmap_workspaces!.set(workspaceId, workspace);
    } else {
      // Find workspace for this user
      const existingEntry = Array.from(globalRegistry.__leadmap_sessions!.values()).find(
        (s) => s.userId === user!.id
      );
      if (existingEntry) {
        workspaceId = existingEntry.workspaceId;
        workspace = globalRegistry.__leadmap_workspaces!.get(workspaceId);
      }
      if (!workspace) {
        workspaceId = `wsp_${Math.random().toString(36).substring(2, 12)}`;
        workspace = {
          id: workspaceId,
          name: `${user.name}'s Workspace`,
          slug: `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-agency`,
          tier: 'FREE',
          credit_balance: 25,
          created_at: new Date().toISOString(),
        };
        globalRegistry.__leadmap_workspaces!.set(workspaceId, workspace);
      }
    }

    const token = `1|leadmap_token_${Math.random().toString(36).substring(2)}${Date.now()}`;
    globalRegistry.__leadmap_sessions!.set(token, { userId: user.id, workspaceId });

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
        token,
      },
      message: 'Authenticated successfully.',
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid email or password.',
      },
      { status: 401 }
    );
  }
}
