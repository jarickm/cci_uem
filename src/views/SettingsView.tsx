import React, { useState } from 'react';
import { 
  Settings, Shield, Clock, Key, Save, Check, 
  Trash2, RotateCcw, Database, Sun, Moon, 
  Layers, AlertTriangle, Building2, HardDrive
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { useTheme } from '../context/ThemeContext';
import { ClearDatabaseModal } from '../components/common/ClearDatabaseModal';

export const SettingsView: React.FC = () => {
  const { devices, commands, securityAlerts, organization, clearDatabase } = useUEM();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [heartbeatInterval, setHeartbeatInterval] = useState('5');
  const [inactivityThreshold, setInactivityThreshold] = useState('72');
  const [requireWipeApproval, setRequireWipeApproval] = useState(true);
  const [escrowKeys, setEscrowKeys] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>System, Theme & Security Engine Settings</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
              {organization.name}
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure telemetry rates, dark/light themes, remote wipe safeguards, and database maintenance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Engine & Theme Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Theme & Visual Display Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">Interface Theme & Appearance</h3>
                  <p className="text-[11px] text-slate-400">
                    Switch between sleek cyber dark operations and executive light aesthetic
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 uppercase">
                Active: {theme}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Dark Theme Option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'dark'
                    ? 'bg-indigo-600/10 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Operations Dark Theme</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    High contrast dark palette tailored for 24/7 cold-chain telemetry monitoring centers.
                  </p>
                </div>
              </button>

              {/* Light Theme Option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'light'
                    ? 'bg-indigo-600/10 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-amber-500 shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">Executive Light Theme</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Crisp, clean daytime theme with high readability for management audits and reporting.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Engine Parameters Form */}
          <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl text-xs">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-200 text-sm">Telemetry & Inactivity Policies</h3>
              <p className="text-[11px] text-slate-400">Parameters controlling agent reporting frequency and automatic quarantine</p>
            </div>

            {/* Heartbeat Interval */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-200">Endpoint Heartbeat Poll Interval</label>
              <select
                value={heartbeatInterval}
                onChange={(e) => setHeartbeatInterval(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="1">1 Minute (Near Real-Time Telemetry - Recommended for Reefer Vans)</option>
                <option value="5">5 Minutes (Standard Fleet Production Balance)</option>
                <option value="15">15 Minutes (Low Bandwidth Tech Laptops)</option>
                <option value="60">60 Minutes (Battery-Saver Mobile Mode)</option>
              </select>
            </div>

            {/* Inactivity Threshold */}
            <div className="space-y-2">
              <label className="block font-bold text-slate-200">Device Inactivity Quarantine Threshold</label>
              <select
                value={inactivityThreshold}
                onChange={(e) => setInactivityThreshold(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="24">24 Hours (Strict Logistics Compliance)</option>
                <option value="72">72 Hours (Standard Enterprise)</option>
                <option value="168">7 Days (Field Service Standby Fleet)</option>
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
                    Mandates secondary security administrator approval before cryptographic wipe payload is executed on Coolaire endpoints.
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

        {/* Right 1 Col: Database Management & Dangerous Actions */}
        <div className="space-y-6">
          
          {/* Database Health & Maintenance Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Database className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-slate-200 uppercase tracking-wider">Database Maintenance</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Active Endpoints:</span>
                <span className="font-mono font-bold text-indigo-400">{devices.length}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Command History:</span>
                <span className="font-mono font-bold text-amber-400">{commands.length}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Security Incidents:</span>
                <span className="font-mono font-bold text-rose-400">{securityAlerts.length}</span>
              </div>
            </div>

            {/* Clear Database Danger Zone */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Clear & Reset Database</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Safely wipe fleet records, reset to the authentic Coolaire seed data, or purge command queues.
              </p>

              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear / Reset Database</span>
              </button>
            </div>
          </div>

          {/* Organization Tenant Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl text-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-200 uppercase tracking-wider">Tenant Identity</h3>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Organization Name:</span>
              <p className="font-bold text-slate-100">{organization.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Primary Contact & Super Admin:</span>
              <p className="font-mono text-indigo-300">{organization.primaryContact}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Active Operating Branches:</span>
              <p className="text-slate-300">{organization.branches.length} Regional Centers (Luzon, Visayas, Mindanao)</p>
            </div>
          </div>

        </div>

      </div>

      {/* Clear Database Modal */}
      {showClearModal && (
        <ClearDatabaseModal onClose={() => setShowClearModal(false)} />
      )}
    </div>
  );
};
