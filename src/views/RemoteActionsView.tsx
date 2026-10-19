import React, { useState } from 'react';
import { 
  Terminal, Play, CheckCircle2, AlertTriangle, 
  Clock, XCircle, ShieldAlert, Check, Plus, Filter, Search, RotateCcw
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { useAuth } from '../context/AuthContext';

interface RemoteActionsViewProps {
  onOpenCommandModal: () => void;
}

export const RemoteActionsView: React.FC<RemoteActionsViewProps> = ({ onOpenCommandModal }) => {
  const { commands, approveCommand, cancelCommand, executeCommandNow, exportCsv } = useUEM();
  const { hasPermission } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCommandLog, setSelectedCommandLog] = useState<string | null>(null);

  const filteredCommands = commands.filter(c => 
    filterStatus === 'all' || c.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Remote Actions & Command Queue</h1>
          <p className="text-xs text-slate-400">
            Durable, idempotent execution pipeline with approval gates for privileged actions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportCsv('commands')}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
          >
            Export Log CSV
          </button>
          <button
            onClick={onOpenCommandModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Command</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs">
        {['all', 'Pending', 'Queued', 'Running', 'Succeeded', 'Failed', 'Cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
              filterStatus === st 
                ? 'bg-indigo-600 text-white font-semibold' 
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            {st === 'all' ? 'All Commands' : st}
          </button>
        ))}
      </div>

      {/* Commands Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target Endpoint</th>
                <th className="px-4 py-3">Requested By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dispatched Time</th>
                <th className="px-4 py-3">Result / Telemetry</th>
                <th className="px-4 py-3 text-right">Approval & Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCommands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No commands matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredCommands.map(cmd => (
                  <tr key={cmd.id} className="hover:bg-slate-800/50">
                    {/* Action */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{cmd.action.toUpperCase()}</span>
                      </div>
                    </td>

                    {/* Target */}
                    <td className="px-4 py-3 font-semibold text-slate-300">
                      {cmd.deviceHostname}
                    </td>

                    {/* Requester */}
                    <td className="px-4 py-3 text-slate-400">
                      {cmd.requestedBy}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cmd.status === 'Succeeded' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        cmd.status === 'Failed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        cmd.status === 'Running' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse' :
                        cmd.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        cmd.status === 'Cancelled' ? 'bg-slate-700 text-slate-400' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {cmd.status}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(cmd.createdAt).toLocaleTimeString()}
                    </td>

                    {/* Result Summary */}
                    <td className="px-4 py-3 max-w-[260px] truncate text-slate-400" title={cmd.result || ''}>
                      {cmd.result || cmd.executionLog || 'Waiting for endpoint poll...'}
                    </td>

                    {/* Action Controls */}
                    <td className="px-4 py-3 text-right">
                      {cmd.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => approveCommand(cmd.id)}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => cancelCommand(cmd.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {cmd.status === 'Queued' && (
                        <button
                          onClick={() => executeCommandNow(cmd.id)}
                          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors"
                        >
                          Execute Now
                        </button>
                      )}

                      {(cmd.status === 'Succeeded' || cmd.status === 'Failed') && (
                        <button
                          onClick={() => setSelectedCommandLog(cmd.executionLog || cmd.result || 'No log details recorded.')}
                          className="text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold"
                        >
                          View Logs
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {selectedCommandLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-100 text-sm">Execution Telemetry Log</h3>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {selectedCommandLog}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedCommandLog(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
