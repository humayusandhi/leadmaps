import type { ApiResponse } from '@leadmap/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  public statusCode: number;
  public errors: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface RequestOptions extends RequestInit {
  workspaceId?: string;
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { workspaceId, token, headers = {}, ...customConfig } = options;

  // Retrieve token from client storage if not passed directly
  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('leadmap_token') || undefined;
  }

  // Retrieve active workspace ID if not provided
  let activeWorkspaceId = workspaceId;
  if (!activeWorkspaceId && typeof window !== 'undefined') {
    activeWorkspaceId = localStorage.getItem('leadmap_workspace_id') || undefined;
  }

  const requestId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Request-ID': requestId,
    ...(activeWorkspaceId ? { 'X-Workspace-ID': activeWorkspaceId } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(headers as Record<string, string>),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders,
    });

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      data: null as unknown as T,
      message: response.statusText,
    }));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('leadmap_token');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }

      const errorPayload = data as unknown as { errors?: Record<string, string[]> };
      throw new ApiError(
        data.message || 'An unexpected API error occurred.',
        response.status,
        errorPayload.errors || {}
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network failure or server unavailable.',
      500
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { method: 'DELETE', ...options }),
};
