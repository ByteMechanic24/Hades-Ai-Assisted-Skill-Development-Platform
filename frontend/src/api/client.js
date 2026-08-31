// ─────────────────────────────────────────────────────────────
// HADES API Client — Central authenticated HTTP helper
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ── Token helpers ────────────────────────────────────────────
const TOKEN_KEY = 'hades_auth_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn('[HADES] Could not persist token', e);
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
}

// ── Custom API Error ─────────────────────────────────────────
export class ApiError extends Error {
  constructor(status, statusText, body) {
    super(`API ${status}: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

// ── Core request function ────────────────────────────────────
async function request(method, path, { body, headers: extraHeaders, auth = true } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = { method, headers };
  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    throw new ApiError(0, 'Network error', { message: err.message });
  }

  // 204 No Content
  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401) {
      try {
        window.dispatchEvent(new CustomEvent('hades:auth:unauthorized'));
      } catch {
        /* noop */
      }
    }
    const errorMessage = data?.error?.message || data?.message || res.statusText;
    throw new ApiError(res.status, errorMessage, data);
  }

  return data;
}

// ── Public convenience methods ───────────────────────────────
export const api = {
  get:  (path, opts) => request('GET', path, { ...opts }),
  post: (path, body, opts) => request('POST', path, { body, ...opts }),
  put:  (path, body, opts) => request('PUT', path, { body, ...opts }),
  del:  (path, opts) => request('DELETE', path, { ...opts }),
};
