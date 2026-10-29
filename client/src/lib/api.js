// Thin fetch wrapper for the Express API.
// In development Vite proxies /api to the server; in production set VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '') + '/api';
const TOKEN_KEY = 'clockit:token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Storage unavailable; session lasts until reload.
    }
  },
};

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function api(path, { method = 'GET', body, query } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('Can’t reach the server. Check your connection and try again.', 0);
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message ?? `Request failed (${response.status}).`, response.status, data.errors);
  }
  return data;
}
