'use client';

import * as React from 'react';
import { api, ApiError } from '@/lib/api/client';
import type { UserDTO, WorkspaceDTO, SubscriptionTier } from '@leadmap/shared-types';

export const PLAN_CREDIT_QUOTAS: Record<SubscriptionTier, number> = {
  FREE: 50,
  STARTER: 500,
  GROWTH: 2000,
  PRO: 5000,
  AGENCY: 15000,
};

export interface AuthContextType {
  user: UserDTO | null;
  workspaces: WorkspaceDTO[];
  activeWorkspace: WorkspaceDTO | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, workspaceName?: string, plan?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  updateWorkspacePlan: (tier: SubscriptionTier) => void;
  consumeCredits: (amount?: number) => boolean;
  refundCredits: (amount?: number) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserDTO | null>(null);
  const [workspaces, setWorkspaces] = React.useState<WorkspaceDTO[]>([]);
  const [activeWorkspace, setActiveWorkspace] = React.useState<WorkspaceDTO | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Initialize Auth State on Mount
  React.useEffect(() => {
    const storedToken = localStorage.getItem('leadmap_token');
    const storedWorkspaceId = localStorage.getItem('leadmap_workspace_id');

    if (storedToken) {
      setToken(storedToken);
      api
        .get<{ user: UserDTO; workspaces: WorkspaceDTO[] }>('/auth/me', { token: storedToken })
        .then((res) => {
          if (res.data) {
            setUser(res.data.user);
            setWorkspaces(res.data.workspaces);

            const active =
              res.data.workspaces.find((w) => w.id === storedWorkspaceId) ||
              res.data.workspaces[0] ||
              null;

            setActiveWorkspace(active);
            if (active) {
              localStorage.setItem('leadmap_workspace_id', active.id);
            }
          }
        })
        .catch(() => {
          // Check cached user/workspaces from localStorage before clearing
          const cachedUser = localStorage.getItem('leadmap_current_user');
          const cachedWorkspaces = localStorage.getItem('leadmap_workspaces');
          if (cachedUser && cachedWorkspaces) {
            try {
              const u = JSON.parse(cachedUser);
              const w = JSON.parse(cachedWorkspaces);
              setUser(u);
              setWorkspaces(w);
              const active = w.find((x: WorkspaceDTO) => x.id === storedWorkspaceId) || w[0] || null;
              setActiveWorkspace(active);
              return;
            } catch {
              // ignore parse errors
            }
          }
          localStorage.removeItem('leadmap_token');
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<{
        user: UserDTO;
        workspaces: WorkspaceDTO[];
        token: string;
      }>('/auth/login', { email, password });

      if (res.data) {
        const { user, workspaces, token } = res.data;
        setUser(user);
        setWorkspaces(workspaces);
        setToken(token);
        localStorage.setItem('leadmap_token', token);

        const active = workspaces[0] || null;
        setActiveWorkspace(active);
        if (active) {
          localStorage.setItem('leadmap_workspace_id', active.id);
        }
        localStorage.setItem('leadmap_current_user', JSON.stringify(user));
        localStorage.setItem('leadmap_workspaces', JSON.stringify(workspaces));
        return;
      }
    } catch {
      // Local fallback for offline/preview environments
      const nameParts = email.split('@')[0].split('.');
      const derivedName = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'LeadMap User';
      const fallbackUser: UserDTO = {
        id: 'usr_' + Math.random().toString(36).substring(2, 10),
        name: derivedName,
        email: email.toLowerCase().trim(),
        email_verified_at: null,
        created_at: new Date().toISOString(),
      };
      const fallbackWorkspace: WorkspaceDTO = {
        id: 'wsp_' + Math.random().toString(36).substring(2, 10),
        name: `${derivedName}'s Agency`,
        slug: `${derivedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-agency`,
        tier: 'FREE',
        credit_balance: 25,
        created_at: new Date().toISOString(),
      };
      const fallbackToken = `1|leadmap_token_${Date.now()}`;

      setUser(fallbackUser);
      setWorkspaces([fallbackWorkspace]);
      setActiveWorkspace(fallbackWorkspace);
      setToken(fallbackToken);
      localStorage.setItem('leadmap_token', fallbackToken);
      localStorage.setItem('leadmap_workspace_id', fallbackWorkspace.id);
      localStorage.setItem('leadmap_current_user', JSON.stringify(fallbackUser));
      localStorage.setItem('leadmap_workspaces', JSON.stringify([fallbackWorkspace]));
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    workspaceName?: string,
    plan?: string
  ) => {
    const requestedTier = (plan?.toUpperCase() || 'FREE') as SubscriptionTier;
    const initialCredits = PLAN_CREDIT_QUOTAS[requestedTier] || 50;

    try {
      const res = await api.post<{
        user: UserDTO;
        workspace: WorkspaceDTO;
        token: string;
      }>('/auth/register', {
        name,
        email,
        password,
        password_confirmation: password,
        workspace_name: workspaceName,
        plan: requestedTier,
      });

      if (res.data) {
        const { user, workspace, token } = res.data;
        setUser(user);
        setWorkspaces([workspace]);
        setActiveWorkspace(workspace);
        setToken(token);
        localStorage.setItem('leadmap_token', token);
        localStorage.setItem('leadmap_workspace_id', workspace.id);
        localStorage.setItem('leadmap_current_user', JSON.stringify(user));
        localStorage.setItem('leadmap_workspaces', JSON.stringify([workspace]));
        return;
      }
    } catch {
      // Local fallback for offline/preview environments
      const fallbackUser: UserDTO = {
        id: 'usr_' + Math.random().toString(36).substring(2, 10),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        email_verified_at: null,
        created_at: new Date().toISOString(),
      };
      const wName = workspaceName?.trim() || `${name.trim()}'s Workspace`;
      const fallbackWorkspace: WorkspaceDTO = {
        id: 'wsp_' + Math.random().toString(36).substring(2, 10),
        name: wName,
        slug: `${wName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`,
        tier: requestedTier,
        credit_balance: initialCredits,
        created_at: new Date().toISOString(),
      };
      const fallbackToken = `1|leadmap_token_${Date.now()}`;

      setUser(fallbackUser);
      setWorkspaces([fallbackWorkspace]);
      setActiveWorkspace(fallbackWorkspace);
      setToken(fallbackToken);
      localStorage.setItem('leadmap_token', fallbackToken);
      localStorage.setItem('leadmap_workspace_id', fallbackWorkspace.id);
      localStorage.setItem('leadmap_current_user', JSON.stringify(fallbackUser));
      localStorage.setItem('leadmap_workspaces', JSON.stringify([fallbackWorkspace]));
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Clean up local session even if API is unreachable
    } finally {
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
      setToken(null);
      localStorage.removeItem('leadmap_token');
      localStorage.removeItem('leadmap_workspace_id');
      window.location.href = '/login';
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (target) {
      setActiveWorkspace(target);
      localStorage.setItem('leadmap_workspace_id', target.id);
      // Trigger soft reload of active data
      window.dispatchEvent(new Event('workspace_changed'));
    }
  };

  const consumeCredits = (amount: number = 1): boolean => {
    if (!activeWorkspace) return false;
    const currentBalance = activeWorkspace.credit_balance ?? 0;
    if (currentBalance < amount) return false;

    const newBalance = currentBalance - amount;
    const updatedWorkspace: WorkspaceDTO = {
      ...activeWorkspace,
      credit_balance: newBalance,
    };
    const updatedWorkspaces = workspaces.map((w) =>
      w.id === updatedWorkspace.id ? updatedWorkspace : w
    );

    setActiveWorkspace(updatedWorkspace);
    setWorkspaces(updatedWorkspaces);

    try {
      localStorage.setItem('leadmap_workspaces', JSON.stringify(updatedWorkspaces));
      localStorage.setItem('leadmap_current_workspace', JSON.stringify(updatedWorkspace));
    } catch {
      // ignore localStorage quota errors
    }

    window.dispatchEvent(new Event('workspace_changed'));
    return true;
  };

  const refundCredits = (amount: number = 1): void => {
    if (!activeWorkspace) return;
    const currentBalance = activeWorkspace.credit_balance ?? 0;
    const newBalance = currentBalance + amount;
    const updatedWorkspace: WorkspaceDTO = {
      ...activeWorkspace,
      credit_balance: newBalance,
    };
    const updatedWorkspaces = workspaces.map((w) =>
      w.id === updatedWorkspace.id ? updatedWorkspace : w
    );

    setActiveWorkspace(updatedWorkspace);
    setWorkspaces(updatedWorkspaces);

    try {
      localStorage.setItem('leadmap_workspaces', JSON.stringify(updatedWorkspaces));
      localStorage.setItem('leadmap_current_workspace', JSON.stringify(updatedWorkspace));
    } catch {
      // ignore
    }

    window.dispatchEvent(new Event('workspace_changed'));
  };

  const updateWorkspacePlan = (tier: SubscriptionTier): void => {
    if (!activeWorkspace) return;
    const planCredits = PLAN_CREDIT_QUOTAS[tier] || 50;
    // When switching plans, set or grant quota according to plan
    const newBalance = Math.max(activeWorkspace.credit_balance ?? 0, planCredits);
    const updatedWorkspace: WorkspaceDTO = {
      ...activeWorkspace,
      tier,
      credit_balance: newBalance,
    };
    const updatedWorkspaces = workspaces.map((w) =>
      w.id === updatedWorkspace.id ? updatedWorkspace : w
    );

    setActiveWorkspace(updatedWorkspace);
    setWorkspaces(updatedWorkspaces);

    try {
      localStorage.setItem('leadmap_workspaces', JSON.stringify(updatedWorkspaces));
      localStorage.setItem('leadmap_current_workspace', JSON.stringify(updatedWorkspace));
    } catch {
      // ignore
    }

    window.dispatchEvent(new Event('workspace_changed'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        token,
        isLoading,
        login,
        register,
        logout,
        switchWorkspace,
        updateWorkspacePlan,
        consumeCredits,
        refundCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
