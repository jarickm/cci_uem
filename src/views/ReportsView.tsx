import React from 'react';
import { FileSpreadsheet, Download, ShieldCheck, Laptop, Terminal, ScrollText } from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const ReportsView: React.FC = () => {
  const { exportCsv, devices, commands, auditEvents } = useUEM();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Enterprise Reports & Data Export</h1>
          <p className="text-xs text-slate-400">
            Generate and export signed CSV reports for executive audits, compliance evidence, and fleet asset tracking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device Inventory Report */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Full Fleet Asset & Hardware Inventory</h3>
              <p className="text-[11px] text-slate-400">Export all {devices.length} endpoints with serials, OS versions, RAM, and assigned staff</p>
            </div>
          </div>
          <button
            onClick={() => exportCsv('devices')}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download CSV Report</span>
          </button>
        </div>

        {/* Security & Compliance Report */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Zero-Trust Compliance & Encryption Audit</h3>
              <p className="text-[11px] text-slate-400">Complete compliance breakdown, BitLocker/FileVault status, and prohibited app evidence</p>
            </div>
          </div>
          <button
            onClick={() => exportCsv('compliance')}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/60 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Generate & Download CSV Report</span>
          </button>
        </div>

        {/* Remote Commands History Report */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Command Execution & Operations Ledger</h3>
              <p className="text-[11px] text-slate-400">Log of all {commands.length} remote actions, execution outputs, and approval records</p>
            </div>
          </div>
          <button
            onClick={() => exportCsv('commands')}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/60 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Generate & Download CSV Report</span>
          </button>
        </div>

        {/* Audit Log Trail Report */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Immutable Administrative Audit Log</h3>
              <p className="text-[11px] text-slate-400">Security event stream for SOC 2, ISO 27001, and HIPAA auditor review</p>
            </div>
          </div>
          <button
            onClick={() => exportCsv('audit')}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/60 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Generate & Download CSV Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
