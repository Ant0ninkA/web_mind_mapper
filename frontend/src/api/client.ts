// Shared HTTP client for the frontend.
//
// Every API module (mindmaps, auth, sharing) goes through `request` so that
// credentials, JSON parsing and error handling stay in one place. Do not call
// `fetch` directly elsewhere.

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3001';

// Step 7: Custom API Error class mapping to backend's structural format
export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const method = options.method || 'GET';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Added credentials: 'include' so cookies automatically travel back and forth
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // Handle HTTP 204 No Content safely (Logout or Password updates)
  if (response.status === 204) {
    return undefined as T;
  }

  // Safely parse JSON from the response text body
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    let errorMessage = response.statusText || 'Request failed';
    let errorDetails: string[] | undefined = undefined;

    if (data && typeof data === 'object') {
      if ('error' in data) errorMessage = String(data.error);
      if ('details' in data && Array.isArray(data.details)) errorDetails = data.details;
    }

    throw new ApiError(response.status, errorMessage, errorDetails);
  }

  return data as T;
}

// Fixed the wrapper mapping arguments to match the signature of request<T>(path, options)
export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
    
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
    
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
    
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
    
  del: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};