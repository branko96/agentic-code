'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearToken,
  createUser,
  deleteUser,
  getConfig,
  getMe,
  getUsers,
  readToken,
  updateUser,
} from '../../lib/auth';
import type { CreateUserInput, NavbarConfig, UpdateUserInput, User } from '../../types/auth';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90';

type DashboardSession = {
  user: User;
  config: NavbarConfig;
};

type UserFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const emptyForm: UserFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [createForm, setCreateForm] = useState<UserFormState>(emptyForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UserFormState>(emptyForm);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingUserId, setIsDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = readToken();

    if (!storedToken) {
      router.replace('/');
      return;
    }

    setToken(storedToken);

    Promise.all([getMe(storedToken), getConfig(storedToken), getUsers(storedToken)])
      .then(([user, config, nextUsers]) => {
        if (!user) {
          throw new Error('Session expired');
        }

        setSession({ user, config });
        setUsers(nextUsers);
      })
      .catch((caughtError) => {
        clearToken();
        setSession(null);
        setUsers([]);
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load dashboard');
        router.replace('/');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  function handleLogout() {
    clearToken();
    router.replace('/');
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setError('');
    setIsSaving(true);

    try {
      const createdUser = await createUser(token, createForm as CreateUserInput);
      setUsers((currentUsers) => [createdUser, ...currentUsers]);
      setCreateForm(emptyForm);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to create user');
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(user: User) {
    setEditingUserId(user.id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
    });
    setError('');
  }

  function cancelEditing() {
    setEditingUserId(null);
    setEditForm(emptyForm);
  }

  async function handleUpdateUser(event: FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();

    if (!token) {
      return;
    }

    const payload: UpdateUserInput = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      ...(editForm.password ? { password: editForm.password } : {}),
    };

    setError('');
    setIsSaving(true);

    try {
      const updatedUser = await updateUser(token, userId, payload);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === userId ? updatedUser : user))
      );
      cancelEditing();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update user');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!token) {
      return;
    }

    setError('');
    setIsDeletingUserId(userId);

    try {
      await deleteUser(token, userId);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to delete user');
    } finally {
      setIsDeletingUserId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <p className="text-sm text-muted">Loading dashboard...</p>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen px-6 py-6 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <nav className="flex w-full items-center justify-between rounded-2xl border border-surface-border bg-surface/90 px-5 py-4 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div>
            <p className="text-lg font-semibold text-white">{session.config.appName}</p>
            <p className="text-sm text-muted">
              {session.config.environment} · {session.config.supportEmail}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-surface-foreground">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-sm text-muted">{session.user.email}</p>
            </div>

            <button type="button" onClick={handleLogout} className={primaryButtonClassName}>
              Log out
            </button>
          </div>
        </nav>

        <section className="dashboard-panel">
          <div>
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-muted">Manage users from the main page.</p>
          </div>

          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <form className="grid gap-4 md:grid-cols-4" onSubmit={handleCreateUser}>
            <input
              type="text"
              placeholder="First name"
              value={createForm.firstName}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, firstName: event.target.value }))
              }
              className="dashboard-input"
              required
            />
            <input
              type="text"
              placeholder="Last name"
              value={createForm.lastName}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, lastName: event.target.value }))
              }
              className="dashboard-input"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, email: event.target.value }))
              }
              className="dashboard-input"
              required
            />
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="Password"
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, password: event.target.value }))
                }
                className="dashboard-input"
                required
              />
              <button
                type="submit"
                disabled={isSaving}
                className={`${primaryButtonClassName} shrink-0 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Create
              </button>
            </div>
          </form>
        </section>

        <section className="dashboard-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isEditing = editingUserId === user.id;

                  return (
                    <tr key={user.id}>
                      <td>
                        {isEditing ? (
                          <div className="grid gap-2">
                            <input
                              type="text"
                              value={editForm.firstName}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  firstName: event.target.value,
                                }))
                              }
                              className="dashboard-input"
                              required
                            />
                            <input
                              type="text"
                              value={editForm.lastName}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  lastName: event.target.value,
                                }))
                              }
                              className="dashboard-input"
                              required
                            />
                          </div>
                        ) : (
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="grid gap-2">
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              className="dashboard-input"
                              required
                            />
                            <input
                              type="password"
                              value={editForm.password}
                              onChange={(event) =>
                                setEditForm((current) => ({
                                  ...current,
                                  password: event.target.value,
                                }))
                              }
                              className="dashboard-input"
                              placeholder="New password"
                            />
                          </div>
                        ) : (
                          <span>{user.email}</span>
                        )}
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</td>
                      <td>
                        {isEditing ? (
                          <form
                            className="flex flex-wrap gap-2"
                            onSubmit={(event) => handleUpdateUser(event, user.id)}
                          >
                            <button
                              type="submit"
                              disabled={isSaving}
                              className={`${primaryButtonClassName} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="dashboard-secondary-button"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(user)}
                              className="dashboard-secondary-button"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isDeletingUserId === user.id}
                              className="dashboard-danger-button disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeletingUserId === user.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
