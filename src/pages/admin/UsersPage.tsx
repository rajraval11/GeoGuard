import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import type { User, UserRole } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/StateViews';
import { Edit2, Ban, Search, Check } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userOverrides, setUserOverrides] = useState<Record<string, Partial<User>>>({});

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers
  });

  const handleToggleSuspend = (userId: string) => {
    setUserOverrides((prev) => {
      const current = prev[userId]?.status || users?.find((u) => u.id === userId)?.status || 'Active';
      return {
        ...prev,
        [userId]: { ...prev[userId], status: current === 'Active' ? 'Suspended' : 'Active' }
      };
    });
  };

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    setUserOverrides((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], role: newRole }
    }));
    setEditingUser(null);
  };

  const allUsers: User[] = (users || []).map((u) => ({
    ...u,
    ...(userOverrides[u.id] || {})
  }));

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            User & Institutional Access Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization members, assign roles (Charterer, Analyst, Admin), and enforce credentials
          </p>
        </div>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, org, email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Institutional Entity</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Account Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {u.organizationName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'Charterer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {u.lastActive || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {u.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                          title="Change Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(u.id)}
                          className={`p-1 rounded transition-colors ${
                            u.status === 'Active'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'Active' ? 'Suspend User' : 'Reactivate User'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Role Dialog */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md border border-slate-300 p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-sm font-bold text-slate-900">
              Update Role: {editingUser.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select access tier for {editingUser.organizationName}
            </p>

            <div className="space-y-2 mt-4">
              {(['Charterer', 'Analyst', 'Admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleUpdateRole(editingUser.id, role)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded text-left border flex items-center justify-between ${
                    editingUser.role === role
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{role}</span>
                  {editingUser.role === role && <Check className="w-3.5 h-3.5 text-blue-700" />}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setEditingUser(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
