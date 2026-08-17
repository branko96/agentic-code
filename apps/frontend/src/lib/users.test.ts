import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './api';
import { readToken } from './auth';
import { createUser, deleteUser, getUsers, updateUser } from './users';

vi.mock('./api', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('./auth', () => ({
  readToken: vi.fn(),
}));

const mockedApiFetch = vi.mocked(apiFetch);
const mockedReadToken = vi.mocked(readToken);

const user = {
  id: '1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
};

describe('users API calls', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
    mockedReadToken.mockReset();
  });

  it('getUsers calls /users with no auth header when logged out', async () => {
    mockedReadToken.mockReturnValue(null);
    mockedApiFetch.mockResolvedValue([user]);

    await expect(getUsers()).resolves.toEqual([user]);
    expect(mockedApiFetch).toHaveBeenCalledWith('/users', { method: 'GET' });
  });

  it('getUsers attaches the token when present', async () => {
    mockedReadToken.mockReturnValue('tok-1');
    mockedApiFetch.mockResolvedValue([user]);

    await expect(getUsers()).resolves.toEqual([user]);
    expect(mockedApiFetch).toHaveBeenCalledWith('/users', { method: 'GET', token: 'tok-1' });
  });

  it('createUser POSTs the input to /users with the token', async () => {
    mockedReadToken.mockReturnValue('tok-1');
    const input = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret',
    };
    mockedApiFetch.mockResolvedValue(user);

    await expect(createUser(input)).resolves.toEqual(user);
    expect(mockedApiFetch).toHaveBeenCalledWith('/users', {
      method: 'POST',
      body: JSON.stringify(input),
      token: 'tok-1',
    });
  });

  it('updateUser PATCHes /users/:id with the input and token', async () => {
    mockedReadToken.mockReturnValue('tok-1');
    const input = { lastName: 'Byron' };
    mockedApiFetch.mockResolvedValue({ ...user, ...input });

    await expect(updateUser('42', input)).resolves.toEqual({ ...user, ...input });
    expect(mockedApiFetch).toHaveBeenCalledWith('/users/42', {
      method: 'PATCH',
      body: JSON.stringify(input),
      token: 'tok-1',
    });
  });

  it('deleteUser DELETEs /users/:id with the token', async () => {
    mockedReadToken.mockReturnValue('tok-1');
    mockedApiFetch.mockResolvedValue(null);

    await expect(deleteUser('42')).resolves.toBeNull();
    expect(mockedApiFetch).toHaveBeenCalledWith('/users/42', {
      method: 'DELETE',
      token: 'tok-1',
    });
  });

  it('propagates apiFetch errors', async () => {
    mockedReadToken.mockReturnValue('tok-1');
    mockedApiFetch.mockRejectedValue(new Error('Forbidden'));
    await expect(getUsers()).rejects.toThrow('Forbidden');
  });
});
