import React, { useState } from 'react';
import { Settings, Shield, Clock, Key, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [heartbeatInterval, setHeartbeatInterval] = useState('5');
  const [inactivityThreshold, setInactivityThreshold] = useState('72');
  const [requireWipeApproval, setRequireWipeApproval] = useState(true);
  const [escrowKeys, setEscrowKeys] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">System & Security Engine Settings</h1>
          <p className="text-xs text-slate-400">
            Global endpoint telemetry rates, remote wipe approval gates, and encryption key escrow parameters
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl max-w-2xl text-xs">
        {/* Heartbeat Interval */}
        <div className="space-y-2">
          <label className="block font-bold text-slate-200">Endpoint Heartbeat Poll Interval (Minutes)</label>
          <select
            value={heartbeatInterval}
            onChange={(e) => setHeartbeatInterval(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
          >
            <option value="1">1 Minute (Near Real-Time Telemetry)</option>
            <option value="5">5 Minutes (Recommended Production Balance)</option>
            <option value="15">15 Minutes (Low Bandwidth Fleet)</option>
            <option value="60">60 Minutes (Battery Optimized Mobile)</option>
          </select>
        </div>

        {/* Inactivity Threshold */}
        <div className="space-y-2">
          <label className="block font-bold text-slate-200">Device Inactivity Quarantine Threshold (Hours)</label>
          <select
            value={inactivityThreshold}
            onChange={(e) => setInactivityThreshold(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
          >
            <option value="24">24 Hours (Strict)</option>
            <option value="72">72 Hours (Standard Enterprise)</option>
            <option value="168">7 Days (Hybrid Workforce)</option>
          </select>
        </div>

        {/* Safeguards Checkboxes */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="flex items-start gap-2.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={requireWipeApproval}
              onChange={(e) => setRequireWipeApproval(e.target.checked)}
              className="mt-0.5 rounded bg-slate-950 border-slate-700 text-indigo-600"
            />
            <div>
              <span className="font-bold text-slate-200 block">Require Two-Man Rule for Remote Wipe</span>
              <span className="text-[11px] text-slate-400">
                Mandates secondary security administrator approval before cryptographic wipe payload is executed on endpoints.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={escrowKeys}
              onChange={(e) => setEscrowKeys(e.target.checked)}
              className="mt-0.5 rounded bg-slate-950 border-slate-700 text-indigo-600"
            />
            <div>
              <span className="font-bold text-slate-200 block">Automatic Recovery Key Escrow to Secure Vault</span>
              <span className="text-[11px] text-slate-400">
                Backs up BitLocker 48-digit recovery passwords and macOS FileVault keys to encrypted Firestore records.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {saved && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Settings updated & applied to fleet
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
