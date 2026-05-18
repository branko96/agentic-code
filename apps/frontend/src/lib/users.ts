import { apiFetch } from './api';
import { readToken } from './auth';
import type { User, CreateUserInput, UpdateUserInput } from '../types/user';

function getAuthHeaders() {
  const token = readToken();
  return token ? { token } : {};
}

export function getUsers(): Promise<User[]> {
  return apiFetch('/users', { method: 'GET', ...getAuthHeaders() });
}

export function createUser(input: CreateUserInput): Promise<User> {
  return apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(input),
    ...getAuthHeaders(),
  });
}

export function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  return apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    ...getAuthHeaders(),
  });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch(`/users/${id}`, {
    method: 'DELETE',
    ...getAuthHeaders(),
  });
}
