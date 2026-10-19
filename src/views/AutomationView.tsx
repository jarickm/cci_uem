import React, { useState } from 'react';
import { Cpu, Clock, Play, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';

interface AutomationItem {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  schedule: string;
  status: 'Active' | 'Paused';
  lastRun: string;
}

export const AutomationView: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationItem[]>([
    {
      id: 'auto-01',
      name: 'Automated 12-Hour Fleet Inventory Synchronization',
      trigger: 'Scheduled Cron Event',
      condition: 'Device Status == Active',
      action: 'Dispatch sync_inventory command to all online endpoints',
      schedule: 'Every 12 hours (00:00, 12:00 UTC)',
      status: 'Active',
      lastRun: new Date(Date.now() - 3 * 3600 * 1000).toLocaleString(),
    },
    {
      id: 'auto-02',
      name: 'Stale Endpoint Detection & Inactivity Alerting',
      trigger: 'Telemetry Heartbeat Monitor',
      condition: 'Device lastCheckIn > 72 hours ago',
      action: 'Flag device as Inactive and create Critical Security Alert',
      schedule: 'Daily at 06:00 UTC',
      status: 'Active',
      lastRun: new Date(Date.now() - 14 * 3600 * 1000).toLocaleString(),
    },
    {
      id: 'auto-03',
      name: 'Immediate Zero-Trust Policy Reassessment',
      trigger: 'New Policy Published / Modified',
      condition: 'Endpoints belonging to target device groups',
      action: 'Trigger apply_policy job queue',
      schedule: 'Event-driven immediate trigger',
      status: 'Active',
      lastRun: new Date(Date.now() - 24 * 3600 * 1000).toLocaleString(),
    },
    {
      id: 'auto-04',
      name: 'Unencrypted Disk Quarantine Notification',
      trigger: 'Compliance Check Failed',
      condition: 'device.isEncrypted == false for > 24 hours',
      action: 'Email user and IT Helpdesk; schedule BitLocker push',
      schedule: 'Continuous evaluation',
      status: 'Active',
      lastRun: new Date(Date.now() - 5 * 3600 * 1000).toLocaleString(),
    }
  ]);

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? {
      ...a,
      status: a.status === 'Active' ? 'Paused' : 'Active',
    } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Automation & Scheduled Operations</h1>
          <p className="text-xs text-slate-400">
            Durable cron jobs, automated stale-endpoint quarantine, and proactive self-healing remediation routines
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {automations.map(auto => (
          <div key={auto.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{auto.name}</h3>
                  <p className="text-[11px] text-slate-400">{auto.schedule} • Last executed: {auto.lastRun}</p>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(auto.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  auto.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-slate-800 text-slate-400'
                }`}
              >
                <span>{auto.status}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Trigger</span>
                <span className="text-slate-200">{auto.trigger}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Conditions</span>
                <span className="text-indigo-300 font-mono text-[11px]">{auto.condition}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Action Performed</span>
                <span className="text-slate-200">{auto.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
