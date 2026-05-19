'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { IconEdit, IconLogin2, IconTrash, IconUserPlus } from '@tabler/icons-react';
import { clearToken, getConfig, getMe, login, persistToken, readToken } from '../lib/auth';
import { getUsers, createUser, updateUser, deleteUser } from '../lib/users';
import type { AuthUser, NavbarConfig } from '../types/auth';
import type { User, CreateUserInput, UpdateUserInput } from '../types/user';

const primaryButtonClassName =
  'inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90';

type SessionState = {
  user: AuthUser;
  config: NavbarConfig;
};

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<SessionState | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = readToken();

    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    Promise.all([getMe(token), getConfig(token)])
      .then(([user, config]) => {
        setSession({ user, config });
      })
      .catch(() => {
        clearToken();
        setSession(null);
      })
      .finally(() => {
        setIsCheckingSession(false);
      });
  }, []);

  useEffect(() => {
    if (!session) return;
    fetchUsers();
  }, [session]);

  async function fetchUsers() {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      persistToken(response.accessToken);

      const config = await getConfig(response.accessToken);

      setSession({ user: response.user, config });
      setPassword('');
    } catch (caughtError) {
      setSession(null);
      clearToken();
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearToken();
    setSession(null);
    setPassword('');
  }

  function openCreateModal() {
    setModalMode('create');
    setEditingUser(null);
    setForm({ firstName: '', lastName: '', email: '', password: '' });
    setModalOpen(true);
  }

  function openEditModal(user: User) {
    setModalMode('edit');
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setUsersError('');
    try {
      if (modalMode === 'create') {
        await createUser(form as CreateUserInput);
      } else if (editingUser) {
        const payload: UpdateUserInput = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
        };
        if (form.password) payload.password = form.password;
        await updateUser(editingUser.id, payload);
      }
      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    if (!window.confirm(`¿Eliminar a ${user.firstName} ${user.lastName}?`)) return;
    setUsersError('');
    try {
      await deleteUser(user.id);
      await fetchUsers();
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  if (isCheckingSession) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4 py-12"
        style={{ backgroundColor: '#f5f5f0' }}
      >
        <p style={{ color: '#6b7280' }}>Checking session...</p>
      </main>
    );
  }

  if (session) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: '#f5f5f0' }}>
        <nav
          className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border px-5 py-4 shadow-sm"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
          }}
        >
          <div>
            <p className="text-lg font-semibold" style={{ color: '#111827' }}>
              {session.config.appName}
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              {session.config.environment} · {session.config.supportEmail}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: '#111827' }}>
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {session.user.email}
              </p>
            </div>

            <button type="button" onClick={handleLogout} className={primaryButtonClassName}>
              Log out
            </button>
          </div>
        </nav>

        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-medium tracking-tight" style={{ color: '#111827' }}>
                Administración de Usuarios
              </h1>
              <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>
                Gestiona los usuarios registrados en el sistema
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: '#7f77dd' }}
            >
              <IconUserPlus size={18} />
              Crear usuario
            </button>
          </div>

          {/* Error */}
          {usersError && (
            <p
              className="mb-4 rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: 'rgba(239,68,68,0.3)',
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: '#dc2626',
              }}
            >
              {usersError}
            </p>
          )}

          {/* Table */}
          <div
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            style={{ borderColor: '#e5e7eb' }}
          >
            {usersLoading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  Cargando usuarios...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  No hay usuarios registrados.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b text-left text-xs font-medium uppercase tracking-wide"
                    style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                  >
                    <th className="px-5 py-3">Nombre</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Creado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t" style={{ borderColor: '#f3f4f6' }}>
                      <td className="px-5 py-3 font-medium" style={{ color: '#111827' }}>
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-5 py-3" style={{ color: '#6b7280' }}>
                        {user.email}
                      </td>
                      <td className="px-5 py-3" style={{ color: '#6b7280' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-lg p-2 transition hover:opacity-80"
                            style={{ color: '#7f77dd' }}
                            title="Editar"
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="rounded-lg p-2 transition hover:opacity-80"
                            style={{ color: '#ef4444' }}
                            title="Eliminar"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal crear/editar */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border bg-white px-8 pb-8 pt-6 shadow-sm"
              style={{ borderColor: '#e5e7eb' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="mb-1 text-[18px] font-medium tracking-tight"
                style={{ color: '#111827' }}
              >
                {modalMode === 'create' ? 'Crear usuario' : 'Editar usuario'}
              </h2>
              <p className="mb-5 text-sm" style={{ color: '#6b7280' }}>
                {modalMode === 'create'
                  ? 'Completa los datos del nuevo usuario'
                  : 'Actualiza los datos del usuario'}
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: '#6b7280' }}
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                      style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#7f77dd';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: '#6b7280' }}
                    >
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                      style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#7f77dd';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                    style={{ color: '#6b7280' }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                    style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7f77dd';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                {modalMode === 'create' && (
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: '#6b7280' }}
                    >
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                      style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#7f77dd';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      required
                      minLength={8}
                    />
                  </div>
                )}

                {modalMode === 'edit' && (
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: '#6b7280' }}
                    >
                      Nueva contraseña{' '}
                      <span className="font-normal normal-case" style={{ color: '#9ca3af' }}>
                        (opcional)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Dejar vacío para no cambiar"
                      className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
                      style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#7f77dd';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      minLength={8}
                    />
                  </div>
                )}

                <div className="mt-2 flex gap-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
                    style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: '#7f77dd' }}
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#f5f5f0' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border bg-white px-8 pb-8 pt-10 shadow-sm"
        style={{ borderColor: '#e5e7eb', borderRadius: '16px' }}
      >
        {/* Icon badge */}
        <div
          className="mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: '#7f77dd', borderRadius: '8px' }}
        >
          <IconLogin2 size={20} color="white" />
        </div>

        <h1
          className="text-center text-[22px] font-medium tracking-tight"
          style={{ color: '#111827' }}
        >
          Iniciar sesión
        </h1>
        <p className="mt-1.5 text-center text-sm" style={{ color: '#6b7280' }}>
          Ingresa con tu cuenta existente
        </p>

        <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <p
              className="mb-1.5 text-xs font-medium uppercase tracking-wide"
              style={{ color: '#6b7280', letterSpacing: '0.02em' }}
            >
              Correo electrónico
            </p>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
              style={{
                height: '38px',
                borderColor: '#e5e7eb',
                color: '#111827',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7f77dd';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <p
              className="mb-1.5 text-xs font-medium uppercase tracking-wide"
              style={{ color: '#6b7280', letterSpacing: '0.02em' }}
            >
              Contraseña
            </p>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border bg-white px-3 text-sm outline-none transition"
              style={{
                height: '38px',
                borderColor: '#e5e7eb',
                color: '#111827',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7f77dd';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Error message */}
          {error ? (
            <p
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: 'rgba(239,68,68,0.3)',
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: '#dc2626',
              }}
            >
              {error}
            </p>
          ) : null}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg px-4 py-3 text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: '#7f77dd' }}
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Bottom link */}
        <p className="mt-6 text-center text-sm" style={{ color: '#6b7280' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-medium" style={{ color: '#7f77dd' }}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
