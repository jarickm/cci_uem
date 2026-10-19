import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Check, Shield } from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const AlertsView: React.FC = () => {
  const { securityAlerts, resolveAlert } = useUEM();
  const [filter, setFilter] = useState<'all' | 'Open' | 'Resolved'>('all');

  const filtered = securityAlerts.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Security Alerts & Threat Detection</h1>
          <p className="text-xs text-slate-400">
            Real-time endpoint anomaly detection, policy violations, and incident response workflow
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            All Alerts ({securityAlerts.length})
          </button>
          <button
            onClick={() => setFilter('Open')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'Open' ? 'bg-rose-600 text-white font-semibold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Open / Active
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'Resolved' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(alert => (
          <div 
            key={alert.id}
            className={`p-5 rounded-2xl border space-y-3 transition-all ${
              alert.status === 'Open' 
                ? 'bg-slate-900 border-rose-900/40 shadow-xl' 
                : 'bg-slate-900/60 border-slate-800 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  alert.severity === 'Critical' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' :
                  'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">{alert.title}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300">
                      {alert.deviceHostname}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">{alert.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  alert.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {alert.severity}
                </span>
                {alert.status === 'Open' ? (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge & Resolve</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved
                  </span>
                )}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span>Detected: {new Date(alert.detectedAt).toLocaleString()}</span>
              {alert.resolvedAt && <span>Resolved by {alert.resolvedBy} at {new Date(alert.resolvedAt).toLocaleTimeString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
