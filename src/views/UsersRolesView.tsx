import React, { useState } from 'react';
import { Users, Shield, Plus, Mail, CheckCircle2 } from 'lucide-react';
import { UserRole, UserProfile } from '../types/uem';
import { useAuth } from '../context/AuthContext';

export const UsersRolesView: React.FC = () => {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([
    {
      id: 'usr-01',
      email: 'jmmontojo2019@gmail.com',
      displayName: 'SecOps Administrator',
      orgId: 'org-apex-01',
      role: 'Super Administrator',
      department: 'Cybersecurity',
      status: 'Active',
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'usr-02',
      email: 'm.vance@apex-global.com',
      displayName: 'Marcus Vance',
      orgId: 'org-apex-01',
      role: 'IT Administrator',
      department: 'Engineering',
      status: 'Active',
      createdAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 'usr-03',
      email: 's.connor@apex-global.com',
      displayName: 'Sarah Connor',
      orgId: 'org-apex-01',
      role: 'Security Administrator',
      department: 'Cybersecurity',
      status: 'Active',
      createdAt: '2026-02-01T11:30:00Z',
    },
    {
      id: 'usr-04',
      email: 't.helpdesk@apex-global.com',
      displayName: 'Tyler Reed',
      orgId: 'org-apex-01',
      role: 'Helpdesk Technician',
      department: 'IT Operations',
      status: 'Active',
      createdAt: '2026-02-05T09:00:00Z',
    },
    {
      id: 'usr-05',
      email: 'e.audit@apex-global.com',
      displayName: 'External Auditor',
      orgId: 'org-apex-01',
      role: 'Auditor',
      department: 'Compliance',
      status: 'Active',
      createdAt: '2026-02-12T14:00:00Z',
    }
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('IT Administrator');
  const [inviteDept, setInviteDept] = useState('Engineering');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      email: inviteEmail,
      displayName: inviteEmail.split('@')[0],
      orgId: 'org-apex-01',
      role: inviteRole,
      department: inviteDept,
      status: 'Invited',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Users, Administrators & RBAC Roles</h1>
          <p className="text-xs text-slate-400">
            Enterprise role-based access control across 9 administrative tiers with least-privilege enforcement
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Administrator</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Assigned RBAC Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Added Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-100">{u.displayName}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-indigo-400">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.department}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Invite Enterprise Administrator</h3>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="admin@apex-global.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Administrative Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  <option value="Organization Administrator">Organization Administrator</option>
                  <option value="IT Administrator">IT Administrator</option>
                  <option value="Security Administrator">Security Administrator</option>
                  <option value="Device Administrator">Device Administrator</option>
                  <option value="Helpdesk Technician">Helpdesk Technician</option>
                  <option value="Auditor">Auditor (Read-Only)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-2 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 font-semibold text-white"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
