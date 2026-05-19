'use client';

import { useCallback, useEffect, useState } from 'react';
import { getUsers, banUser } from '@/lib/users';
import { readToken } from '@/lib/auth';
import type { User } from '@/types/user';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBan = async (user: User) => {
    try {
      setError(null);
      await banUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isBanned: !u.isBanned } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      user.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {user.isBanned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleBan(user)}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      user.isBanned
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
