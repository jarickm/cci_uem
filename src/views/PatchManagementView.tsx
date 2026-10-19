import React, { useState } from 'react';
import { 
  RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  Clock, Check, Play, ShieldAlert, Download, Terminal 
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const PatchManagementView: React.FC = () => {
  const { patches, devices, triggerWindowsUpdateScan, approvePatch, installPatchOnFleet, exportCsv } = useUEM();
  const [isScanning, setIsScanning] = useState(false);
  const [deployingKb, setDeployingKb] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    await triggerWindowsUpdateScan();
    setTimeout(() => setIsScanning(false), 2200);
  };

  const handleDeployPatch = async (patchId: string, kb: string) => {
    setDeployingKb(kb);
    await installPatchOnFleet(patchId);
    setTimeout(() => setDeployingKb(null), 2000);
  };

  const windowsDevices = devices.filter(d => d.platform === 'windows');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">True Windows Update & OS Patch Servicing</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Windows Update Agent (WUA) API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real Microsoft Update Catalog bulletins, CVE vulnerability remediations, and controlled reboot orchestration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportCsv('patches')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Patch CSV</span>
          </button>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Querying WUA Engine...' : 'Scan Windows Updates'}</span>
          </button>
        </div>
      </div>

      {/* Windows Servicing Architecture Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-200">Production Servicing Window & Deferral Policy</h4>
            <p className="text-slate-400 text-[11px]">
              Saturdays 02:00 AM – 05:00 AM Local Fleet Time • Quality Updates Deferral: 7 Days • Feature Updates: 30 Days
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30">
          USOClient Active ({windowsDevices.length} Windows Endpoints)
        </span>
      </div>

      {/* Patch Bulletins Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Microsoft Update Bulletins & Vulnerability Fixes ({patches.length})
          </h3>
          <span className="text-[11px] text-slate-400">Synchronized with Microsoft Update Catalog</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">KB Article</th>
                <th className="px-4 py-3">Bulletin Title & CVEs</th>
                <th className="px-4 py-3">Severity & CVSS</th>
                <th className="px-4 py-3">Fleet Installed</th>
                <th className="px-4 py-3">Reboot Req.</th>
                <th className="px-4 py-3">Approval State</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {patches.map(patch => (
                <tr key={patch.id} className="hover:bg-slate-800/50">
                  {/* KB */}
                  <td className="px-4 py-3 font-mono font-bold text-indigo-300 text-xs">
                    {patch.kbNumber}
                  </td>

                  {/* Title & CVE */}
                  <td className="px-4 py-3 max-w-[340px]">
                    <div className="font-semibold text-slate-100">{patch.title}</div>
                    {patch.cveList && patch.cveList.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {patch.cveList.map(cve => (
                          <span key={cve} className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-slate-800 text-amber-300 border border-slate-700">
                            {cve}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Severity & CVSS */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        patch.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {patch.severity}
                      </span>
                      {patch.cvssScore && (
                        <span className="text-[10px] font-mono text-slate-300">
                          CVSS {patch.cvssScore}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Fleet Coverage */}
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-semibold">{patch.installedCount} Compliant</span>
                    {patch.missingCount > 0 && (
                      <span className="text-rose-400 ml-2 font-semibold">{patch.missingCount} Missing</span>
                    )}
                  </td>

                  {/* Reboot */}
                  <td className="px-4 py-3 text-slate-300">
                    {patch.rebootRequired ? (
                      <span className="text-amber-400 font-semibold text-[11px]">Reboot Required</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No Reboot</span>
                    )}
                  </td>

                  {/* Approval State */}
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      patch.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {patch.approvalStatus}
                    </span>
                  </td>

                  {/* Deploy Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {patch.approvalStatus !== 'Approved' ? (
                        <button
                          onClick={() => approvePatch(patch.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeployPatch(patch.id, patch.kbNumber)}
                          disabled={deployingKb === patch.kbNumber}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          <span>{deployingKb === patch.kbNumber ? 'Pushing...' : 'Deploy to Fleet'}</span>
                        </button>
                      )}
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
