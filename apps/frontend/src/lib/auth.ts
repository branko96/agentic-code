import { apiFetch } from './api';
import type { AuthResponse, AuthUser, LoginInput, NavbarConfig } from '../types/auth';

const AUTH_TOKEN_STORAGE_KEY = 'accessToken';

export function readToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function persistToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function login(input: LoginInput) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
}

export function getMe(token: string) {
  return apiFetch<AuthUser>('/auth/me', {
    method: 'GET',
    token,
  });
}

export function getConfig(token: string) {
  return apiFetch<NavbarConfig>('/config', {
    method: 'GET',
    token,
  });
}
