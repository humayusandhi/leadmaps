'use client';

import * as React from 'react';
import { api, ApiError } from '@/lib/api/client';
import type { UserDTO, WorkspaceDTO } from '@leadmap/shared-types';

export interface AuthContextType {
  user: UserDTO | null;
  workspaces: WorkspaceDTO[];
  activeWorkspace: WorkspaceDTO | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, workspaceName?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
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
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    workspaceName?: string
  ) => {
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
    });

    if (res.data) {
      const { user, workspace, token } = res.data;
      setUser(user);
      setWorkspaces([workspace]);
      setActiveWorkspace(workspace);
      setToken(token);
      localStorage.setItem('leadmap_token', token);
      localStorage.setItem('leadmap_workspace_id', workspace.id);
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
