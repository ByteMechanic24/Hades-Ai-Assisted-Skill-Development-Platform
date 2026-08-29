// ─────────────────────────────────────────────────────────────
// Auth API — sign-up, sign-in, OAuth login
// ─────────────────────────────────────────────────────────────
import { api } from './client';

/**
 * Register a new user.
 * POST /api/v1/auth/sign-up
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ token: string, user: { id, name, email, avatar, has_generated_roadmap } }}
 */
export function signUp({ name, email, password }) {
  return api.post('/api/v1/auth/sign-up', { name, email, password }, { auth: false });
}

/**
 * Authenticate an existing user.
 * POST /api/v1/auth/sign-in
 * @param {{ email: string, password: string }} data
 * @returns {{ token: string, user: { id, name, email, avatar, has_generated_roadmap } }}
 */
export function signIn({ email, password }) {
  return api.post('/api/v1/auth/sign-in', { email, password }, { auth: false });
}

/**
 * Google OAuth login.
 * POST /api/v1/auth/oauth-login
 * @param {{ provider: string, providerToken: string, email: string, name: string }} data
 * @returns {{ token: string, user: { id, name, email, avatar, has_generated_roadmap } }}
 */
export function oauthLogin({ provider, providerToken, email, name }) {
  return api.post('/api/v1/auth/oauth-login', { provider, providerToken, email, name }, { auth: false });
}
