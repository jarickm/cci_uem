import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Check, X } from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const PatchManagementView: React.FC = () => {
  const { patches, devices } = useUEM();
  const [patchList, setPatchList] = useState(patches);

  const toggleApproval = (id: string, newStatus: 'Approved' | 'Declined') => {
    setPatchList(prev => prev.map(p => p.id === id ? { ...p, approvalStatus: newStatus } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Operating System & Patch Management</h1>
          <p className="text-xs text-slate-400">
            Native OS servicing integration (Windows Update / Apple MDM / APT) with maintenance windows and reboot orchestration
          </p>
        </div>
      </div>

      {/* Maintenance Window Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-200">Scheduled Corporate Maintenance Window</h4>
            <p className="text-slate-400 text-[11px]">Saturdays 02:00 AM – 05:00 AM Local Fleet Time • Automatic user notification & reboot deferral</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30">
          Window Configured
        </span>
      </div>

      {/* Patch Items Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            OS Security Bulletins & Cumulative Updates ({patchList.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">KB / Patch Reference</th>
                <th className="px-4 py-3">Bulletin Title</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Fleet Coverage</th>
                <th className="px-4 py-3">Approval State</th>
                <th className="px-4 py-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {patchList.map(patch => (
                <tr key={patch.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-300">{patch.kbNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-200 max-w-[320px]">{patch.title}</td>
                  <td className="px-4 py-3 capitalize">{patch.platform}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      patch.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {patch.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-semibold">{patch.installedCount} Installed</span>
                    {patch.missingCount > 0 && <span className="text-rose-400 ml-2">{patch.missingCount} Missing</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      patch.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {patch.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleApproval(patch.id, 'Approved')}
                        className="px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => toggleApproval(patch.id, 'Declined')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                      >
                        Decline
                      </button>
                    </div>
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
