import { apiFetch } from './api';
import type {
  AuthResponse,
  AuthUser,
  CreateUserInput,
  LoginInput,
  NavbarConfig,
  UpdateUserInput,
  User,
} from '../types/auth';

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

export function getUsers(token: string) {
  return apiFetch<User[]>('/users', {
    method: 'GET',
    token,
  });
}

export function createUser(token: string, input: CreateUserInput) {
  return apiFetch<User>('/users', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export function updateUser(token: string, id: string, input: UpdateUserInput) {
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}

export function deleteUser(token: string, id: string) {
  return apiFetch<User>(`/users/${id}`, {
    method: 'DELETE',
    token,
  });
}
