import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './api';
import { clearToken, getConfig, getMe, login, persistToken, readToken, register } from './auth';

vi.mock('./api', () => ({
  apiFetch: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);

function installLocalStorage() {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  };
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: localStorageMock },
    configurable: true,
  });
  return { store, localStorageMock };
}

describe('token helpers', () => {
  it('readToken returns null when localStorage is unavailable', () => {
    Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });
    expect(readToken()).toBeNull();
  });

  it('persistToken stores the token and readToken reads it back', () => {
    const { localStorageMock, store } = installLocalStorage();
    persistToken('abc123');
    expect(store.get('accessToken')).toBe('abc123');
    expect(localStorageMock.getItem('accessToken')).toBe('abc123');
    expect(readToken()).toBe('abc123');
  });

  it('readToken returns null when nothing is stored', () => {
    installLocalStorage();
    expect(readToken()).toBeNull();
  });

  it('clearToken removes the stored token', () => {
    const { store } = installLocalStorage();
    persistToken('abc123');
    clearToken();
    expect(store.has('accessToken')).toBe(false);
    expect(readToken()).toBeNull();
  });
});

describe('auth API calls', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
  });

  it('register POSTs the input to /auth/register', async () => {
    const input = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret',
    };
    const response = { accessToken: 'tok', user: { id: '1', email: input.email } };
    mockedApiFetch.mockResolvedValue(response);

    await expect(register(input)).resolves.toEqual(response);
    expect(mockedApiFetch).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  });

  it('login POSTs email and password to /auth/login', async () => {
    const input = { email: 'ada@example.com', password: 'secret' };
    const response = { accessToken: 'tok', user: { id: '1', email: input.email } };
    mockedApiFetch.mockResolvedValue(response);

    await expect(login(input)).resolves.toEqual(response);
    expect(mockedApiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  });

  it('getMe GETs /auth/me with the token', async () => {
    const user = { id: '1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' };
    mockedApiFetch.mockResolvedValue(user);

    await expect(getMe('tok-1')).resolves.toEqual(user);
    expect(mockedApiFetch).toHaveBeenCalledWith('/auth/me', { method: 'GET', token: 'tok-1' });
  });

  it('getConfig GETs /config with the token', async () => {
    const config = { appName: 'agentic-code', environment: 'dev', supportEmail: 'x@y.z' };
    mockedApiFetch.mockResolvedValue(config);

    await expect(getConfig('tok-2')).resolves.toEqual(config);
    expect(mockedApiFetch).toHaveBeenCalledWith('/config', { method: 'GET', token: 'tok-2' });
  });

  it('propagates apiFetch errors', async () => {
    mockedApiFetch.mockRejectedValue(new Error('Unauthorized'));
    await expect(getMe('bad-token')).rejects.toThrow('Unauthorized');
  });
});
