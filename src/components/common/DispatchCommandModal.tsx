import React, { useState } from 'react';
import { X, Terminal, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CommandAction, Device } from '../../types/uem';
import { useUEM } from '../../context/UEMContext';

interface DispatchCommandModalProps {
  device?: Device;
  onClose: () => void;
}

export const DispatchCommandModal: React.FC<DispatchCommandModalProps> = ({ device, onClose }) => {
  const { devices, dispatchCommand } = useUEM();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(device?.id || devices[0]?.id || '');
  const [action, setAction] = useState<CommandAction>('sync_inventory');
  const [scriptBody, setScriptBody] = useState('Get-Process | Where-Object WorkingSet -gt 500MB');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);
  const isDestructive = action === 'wipe' || action === 'lock' || action === 'shutdown';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId) return;

    setIsSubmitting(true);
    const params = action === 'run_script' ? { script: scriptBody } : undefined;
    await dispatchCommand(selectedDeviceId, action, params, isDestructive);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Dispatch Remote Action</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Device */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Target Endpoint</label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.hostname} ({d.platform} • {d.assignedUser})
                </option>
              ))}
            </select>
          </div>

          {/* Action Select */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Command Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as CommandAction)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="sync_inventory">Sync Inventory (Hardware & Software)</option>
              <option value="diagnostic_bundle">Collect Diagnostic Logs & Crash Dumps</option>
              <option value="restart">Initiate Controlled OS Restart</option>
              <option value="shutdown">Initiate System Shutdown</option>
              <option value="lock">Remote Screen & Session Lock</option>
              <option value="run_script">Execute Allowlisted Diagnostic Script</option>
              <option value="wipe">Cryptographic Remote Wipe (High Impact)</option>
            </select>
          </div>

          {/* Script Parameter if applicable */}
          {action === 'run_script' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">PowerShell / Bash Script Content</label>
              <textarea
                value={scriptBody}
                onChange={(e) => setScriptBody(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* High Impact Warning */}
          {isDestructive && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-bold text-[11px]">Privileged Operation Safeguard</p>
                <p className="text-[10px] text-rose-400/90 mt-0.5">
                  This command impacts user availability and requires explicit confirmation in the execution queue.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-all ${
                isDestructive 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {isSubmitting ? 'Queueing...' : isDestructive ? 'Submit for Approval' : 'Queue Command'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
