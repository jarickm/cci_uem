import React, { useState } from 'react';
import { 
  QrCode, Plus, Copy, Check, Shield, 
  Terminal, Laptop, AlertCircle, Trash2, Key 
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { Platform } from '../types/uem';

interface EnrollmentViewProps {
  onOpenEnrollModal: () => void;
}

export const EnrollmentView: React.FC<EnrollmentViewProps> = ({ onOpenEnrollModal }) => {
  const { enrollmentTokens, revokeEnrollmentToken, organization } = useUEM();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Device Enrollment & Onboarding</h1>
          <p className="text-xs text-slate-400">
            Generate time-bounded, revocable enrollment tokens and deploy native endpoint agents
          </p>
        </div>

        <button
          onClick={onOpenEnrollModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Enrollment Invitation</span>
        </button>
      </div>

      {/* Cross-Platform Onboarding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Windows Agent Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              W
            </div>
            <div>
              <h3 className="font-bold text-slate-200">Windows 11 / 10 Agent</h3>
              <p className="text-[11px] text-slate-400">PowerShell & MSI Silent Installer</p>
            </div>
          </div>
          <p className="text-slate-400 text-[11px]">
            Runs as a SYSTEM background service. Enforces BitLocker encryption, collects hardware/software inventory, and listens for remote actions.
          </p>
          <div className="p-2.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
            powershell -ExecutionPolicy Bypass -File .\VanguardAgent.ps1 -EnrollmentToken &lt;TOKEN&gt;
          </div>
        </div>

        {/* macOS MDM Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <h3 className="font-bold text-slate-200">macOS Sequoia / Sonoma</h3>
              <p className="text-[11px] text-slate-400">Apple MDM & Vanguard Daemon</p>
            </div>
          </div>
          <p className="text-slate-400 text-[11px]">
            Installs configuration profile for FileVault key escrow, gatekeeper compliance, and root certificate deployment.
          </p>
          <div className="p-2.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
            sudo curl -sSL https://uem.apex-global.com/macos/enroll.mobileconfig -o /tmp/enroll.mobileconfig
          </div>
        </div>

        {/* Mobile MDM Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
              M
            </div>
            <div>
              <h3 className="font-bold text-slate-200">Android Enterprise & iOS</h3>
              <p className="text-[11px] text-slate-400">Work Profile & Supervised MDM</p>
            </div>
          </div>
          <p className="text-slate-400 text-[11px]">
            QR code zero-touch enrollment into corporate work profile. Separates business apps from personal data.
          </p>
          <div className="p-2.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
            Scan Enterprise QR code during initial device setup wizard.
          </div>
        </div>
      </div>

      {/* Active Enrollment Tokens Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active & Historic Enrollment Tokens ({enrollmentTokens.length})
            </h3>
            <p className="text-[11px] text-slate-400">Tokens automatically revoke after maximum redemptions or expiry</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Token String</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Assigned Department</th>
                <th className="px-4 py-3">Redemptions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires At</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {enrollmentTokens.map(tok => (
                <tr key={tok.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-300">{tok.token}</span>
                      <button
                        onClick={() => copyText(tok.token)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy Token"
                      >
                        {copiedToken === tok.token ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize font-medium text-slate-200">{tok.platform}</td>
                  <td className="px-4 py-3 text-slate-300">{tok.department}</td>
                  <td className="px-4 py-3 font-mono">
                    {tok.usedCount} / {tok.maxUses}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      tok.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {tok.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {new Date(tok.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{tok.createdBy}</td>
                  <td className="px-4 py-3 text-right">
                    {tok.status === 'active' && (
                      <button
                        onClick={() => revokeEnrollmentToken(tok.id)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-2 py-1 rounded hover:bg-slate-800"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
