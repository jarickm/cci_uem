import React, { useState } from 'react';
import { ScrollText, Download, Search, ShieldCheck } from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const AuditLogsView: React.FC = () => {
  const { auditEvents, exportCsv } = useUEM();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = auditEvents.filter(a => 
    a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.details && a.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Immutable Administrative Audit Log</h1>
          <p className="text-xs text-slate-400">
            Append-only security log recording policy alterations, command dispatches, and authentication events
          </p>
        </div>

        <button
          onClick={() => exportCsv('audit')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor Identity</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Contextual Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(event => (
                <tr key={event.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{event.actorEmail}</td>
                  <td className="px-4 py-3 font-mono text-indigo-400 font-bold">{event.action}</td>
                  <td className="px-4 py-3 capitalize text-slate-300">{event.targetResource}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      {event.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={event.details}>
                    {event.details}
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
