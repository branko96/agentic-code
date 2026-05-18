'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconTrash, IconUserPlus } from '@tabler/icons-react';
import { readToken } from '../../../lib/auth';
import { getUsers, createUser, updateUser, deleteUser } from '../../../lib/users';
import type { User, CreateUserInput, UpdateUserInput } from '../../../types/user';

const inputStyle = 'w-full rounded-lg border bg-white px-3 text-sm outline-none transition';
const inputFocus = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#7f77dd';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(127,119,221,0.2)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e5e7eb';
    e.currentTarget.style.boxShadow = 'none';
  },
};

type ModalMode = 'create' | 'edit';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!readToken()) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
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
    setError('');
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
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    if (!window.confirm(`¿Eliminar a ${user.firstName} ${user.lastName}?`)) return;
    setError('');
    try {
      await deleteUser(user.id);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  return (
    <main className="min-h-screen px-6 py-8" style={{ backgroundColor: '#f5f5f0' }}>
      <div className="mx-auto max-w-5xl">
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
        {error && (
          <p
            className="mb-4 rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: 'rgba(239,68,68,0.3)',
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: '#dc2626',
            }}
          >
            {error}
          </p>
        )}

        {/* Table */}
        <div
          className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: '#e5e7eb' }}
        >
          {loading ? (
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
                    {...inputFocus}
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={inputStyle}
                    style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
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
                    {...inputFocus}
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={inputStyle}
                    style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
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
                  {...inputFocus}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputStyle}
                  style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
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
                    {...inputFocus}
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={inputStyle}
                    style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
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
                    {...inputFocus}
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Dejar vacío para no cambiar"
                    className={inputStyle}
                    style={{ height: '38px', borderColor: '#e5e7eb', color: '#111827' }}
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
