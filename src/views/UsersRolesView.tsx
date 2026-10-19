import React, { useState } from 'react';
import { 
  Users, Shield, Plus, Mail, CheckCircle2, ShieldCheck, 
  Key, Lock, AlertTriangle, UserCheck, Trash2, Building2, 
  ShieldAlert, RefreshCw
} from 'lucide-react';
import { UserRole, UserProfile } from '../types/uem';
import { useAuth } from '../context/AuthContext';
import { useUEM } from '../context/UEMContext';

export const UsersRolesView: React.FC = () => {
  const { 
    userProfile, designatedAdmins, allowedEmails, 
    addAllowedEmail, removeAllowedEmail 
  } = useAuth();
  const { organization } = useUEM();

  const [newEmail, setNewEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('IT Administrator');
  const [inviteDept, setInviteDept] = useState('Corporate IT & Systems Infrastructure');
  const [inviteName, setInviteName] = useState('');

  const [customUsers, setCustomUsers] = useState<UserProfile[]>([
    {
      id: 'usr-04',
      email: 'm.deleon@coolaire.com.ph',
      displayName: 'Mark De Leon',
      orgId: organization.id || 'org-cci-01',
      role: 'Device Administrator',
      department: 'Cold Chain Logistics & Reefer Fleet',
      status: 'Active',
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'usr-05',
      email: 'danilo.reyes@coolaire.com.ph',
      displayName: 'Danilo Reyes',
      orgId: organization.id || 'org-cci-01',
      role: 'Helpdesk Technician',
      department: 'Manufacturing & Reefer Assembly Plant',
      status: 'Active',
      createdAt: '2026-02-01T10:00:00Z',
    },
    {
      id: 'usr-06',
      email: 'external.auditor@sgv.com.ph',
      displayName: 'SGV & Co. Auditor',
      orgId: organization.id || 'org-cci-01',
      role: 'Auditor',
      department: 'Cold Storage Facility Operations',
      status: 'Active',
      createdAt: '2026-02-10T14:00:00Z',
    }
  ]);

  const handleAddAllowedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    addAllowedEmail(newEmail.trim());
    setNewEmail('');
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      email: inviteEmail,
      displayName: inviteName || inviteEmail.split('@')[0],
      orgId: organization.id || 'org-cci-01',
      role: inviteRole,
      department: inviteDept,
      status: 'Invited',
      createdAt: new Date().toISOString(),
    };

    setCustomUsers(prev => [newUser, ...prev]);
    addAllowedEmail(inviteEmail);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Users, Administrators & Access Control</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
              {organization.name}
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Least-privilege role-based access control, designated administrators, and strict Google sign-in domain policies
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Invite New Administrator</span>
        </button>
      </div>

      {/* 1. DESIGNATED ADMINISTRATORS (3 ADMINS SECTION) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Designated Enterprise Administrators (3 Designated Admins)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Hardware FIDO2 MFA & zero-trust session validation enforced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {designatedAdmins.map((admin, idx) => (
            <div 
              key={admin.id} 
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={admin.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt={admin.displayName} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md"
                    />
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{admin.displayName}</h3>
                      <p className="font-mono text-[11px] text-indigo-400">{admin.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    Admin #{idx + 1}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">Assigned Role:</span>
                    <span className="font-semibold text-slate-200">{admin.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">Department:</span>
                    <span className="text-slate-300 truncate max-w-[170px] text-right">{admin.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">MFA Status:</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> FIDO2 Enforced
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">Last Active:</span>
                    <span className="text-slate-400 font-mono text-[11px]">{admin.lastLogin || 'Online now'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Access Scope:</span>
                <span className="font-semibold text-indigo-300">
                  {admin.role === 'Super Administrator' ? 'Full Enterprise Root' : 'Fleet & Policy Controls'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SIGN-IN ACCESS RESTRICTION & ALLOWLIST POLICY */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Google Authentication Domain & Email Restriction</h3>
              <p className="text-[11px] text-slate-400">
                Prevents arbitrary Gmail accounts from authenticating. Only authorized Coolaire emails & @coolaire.com.ph domain are permitted.
              </p>
            </div>
          </div>
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Domain Lock Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Approved Emails List */}
          <div className="space-y-3">
            <span className="font-bold text-slate-200 block">Authorized Administrator Emails ({allowedEmails.length})</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {allowedEmails.map(email => (
                <div key={email} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="font-mono text-slate-200">{email}</span>
                  {email !== 'jmmontojo2019@gmail.com' ? (
                    <button
                      onClick={() => removeAllowedEmail(email)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Revoke access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10">
                      Primary Super Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Authorized Admin Form */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-200 block mb-1">Add Approved Administrator Email</span>
              <p className="text-[11px] text-slate-400 mb-3">
                Grant login privileges to an external Google or Coolaire corporate address.
              </p>
              <form onSubmit={handleAddAllowedEmail} className="space-y-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. director.operations@coolaire.com.ph"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Authorize Administrator Email</span>
                </button>
              </form>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
              Note: Any account matching the wildcard <strong>*@coolaire.com.ph</strong> is automatically granted standard directory access.
            </div>
          </div>
        </div>
      </div>

      {/* 3. ALL REGISTERED OPERATIONAL USERS TABLE */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Management & Helpdesk Accounts ({designatedAdmins.length + customUsers.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Role assignments evaluated in real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">User Profile</th>
                <th className="p-3 font-semibold">Role Tier</th>
                <th className="p-3 font-semibold">Department</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">MFA</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {[...designatedAdmins, ...customUsers].map(u => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-medium text-slate-100">
                    <div>
                      <p className="font-bold">{u.displayName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{u.department}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> FIDO2 / Authenticator
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                    >
                      Audit Permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Invite Administrator to CCI Tenant</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Engr. Ferdinand Lopez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="f.lopez@coolaire.com.ph"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned RBAC Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                >
                  <option value="IT Administrator">IT Administrator</option>
                  <option value="Security Administrator">Security Administrator</option>
                  <option value="Device Administrator">Device Administrator</option>
                  <option value="Helpdesk Technician">Helpdesk Technician</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <select
                  value={inviteDept}
                  onChange={(e) => setInviteDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                >
                  {organization.departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
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
