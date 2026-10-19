import React, { useState } from 'react';
import { 
  X, Laptop, Cpu, HardDrive, ShieldCheck, Terminal, 
  Activity, User, Package, RefreshCw, Lock, AlertTriangle, 
  Power, ShieldAlert, CheckCircle2, Clock, Check, Ban
} from 'lucide-react';
import { Device, CommandAction } from '../../types/uem';
import { useUEM } from '../../context/UEMContext';
import { useAuth } from '../../context/AuthContext';

interface DeviceDetailsModalProps {
  device: Device;
  onClose: () => void;
  onDispatchCommand: (deviceId: string, action: CommandAction) => void;
}

export const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ 
  device, 
  onClose,
  onDispatchCommand 
}) => {
  const { policies, commands, deployments, auditEvents } = useUEM();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'hardware' | 'software' | 'policies' | 'compliance' | 'commands' | 'activity' | 'user' | 'deployments'
  >('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Laptop },
    { id: 'hardware', label: 'Hardware', icon: Cpu },
    { id: 'software', label: 'Software', icon: Package },
    { id: 'policies', label: 'Policies', icon: ShieldCheck },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle2 },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'user', label: 'Assigned User', icon: User },
    { id: 'deployments', label: 'Deployments', icon: Clock },
  ];

  const deviceCommands = commands.filter(c => c.deviceId === device.id);
  const deviceAudits = auditEvents.filter(a => a.targetId === device.id);
  const deviceDeployments = deployments.filter(d => d.targetDeviceIds.includes(device.id));
  const appliedPolicies = policies.filter(p => device.appliedPolicyIds.includes(p.id));

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{device.hostname}</h2>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  device.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  device.status === 'Noncompliant' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-slate-700/50 text-slate-300'
                }`}>
                  {device.status}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  device.complianceStatus === 'Pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  Compliance: {device.complianceStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {device.hardware.manufacturer} {device.hardware.model} • {device.osVersion} • Serial: {device.serialNumber}
              </p>
            </div>
          </div>

          {/* Quick Remote Actions Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDispatchCommand(device.id, 'sync_inventory')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
              title="Request inventory refresh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sync</span>
            </button>
            <button
              onClick={() => onDispatchCommand(device.id, 'restart')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
              title="Initiate restart"
            >
              <Power className="w-3.5 h-3.5 text-amber-400" />
              <span>Restart</span>
            </button>
            <button
              onClick={() => onDispatchCommand(device.id, 'lock')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
              title="Remotely lock screen"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lock</span>
            </button>
            <button
              onClick={() => onDispatchCommand(device.id, 'wipe')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-medium border border-rose-800/60 transition-colors"
              title="Cryptographic remote wipe"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Remote Wipe</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 9-Tab Navigation Bar */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/30 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/40">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Security Posture</span>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Volume Encryption</span>
                      <span className={`font-semibold ${device.isEncrypted ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {device.isEncrypted ? 'BitLocker Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">OS Firewall</span>
                      <span className={`font-semibold ${device.firewallEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {device.firewallEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">EDR / Antivirus</span>
                      <span className={`font-semibold ${device.antivirusActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {device.antivirusActive ? 'Protected' : 'Missing'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Network & Connectivity</span>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">IP Address</span>
                      <span className="font-mono text-slate-200">{device.ipAddress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">MAC Address</span>
                      <span className="font-mono text-slate-200">{device.macAddress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Agent Version</span>
                      <span className="text-indigo-400 font-mono">{device.agentVersion}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lifecycle & Telemetry</span>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Last Check-In</span>
                      <span className="text-slate-200">{new Date(device.lastCheckIn).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Enrolled At</span>
                      <span className="text-slate-200">{new Date(device.enrolledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Asset Tag</span>
                      <span className="text-slate-200">{device.assetTag || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware Quick Summary Bar */}
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Resource Allocation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Storage Used</span>
                      <span className="text-slate-400 font-mono">
                        {device.hardware.storageTotalGb - device.hardware.storageAvailableGb} GB / {device.hardware.storageTotalGb} GB
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${Math.round(((device.hardware.storageTotalGb - device.hardware.storageAvailableGb) / device.hardware.storageTotalGb) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Memory Installed</span>
                      <span className="text-slate-400 font-mono">{device.hardware.memoryGb} GB DDR5 RAM</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full w-3/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. HARDWARE TAB */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Processor & Architecture</h4>
                  <div className="space-y-2 text-slate-300">
                    <p><span className="text-slate-400">Processor:</span> {device.hardware.cpu}</p>
                    <p><span className="text-slate-400">Physical Cores:</span> {device.hardware.cores} Cores</p>
                    <p><span className="text-slate-400">Architecture:</span> {device.architecture}</p>
                    <p><span className="text-slate-400">BIOS / Firmware:</span> {device.hardware.biosVersion || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Device Specs & Enclosure</h4>
                  <div className="space-y-2 text-slate-300">
                    <p><span className="text-slate-400">Manufacturer:</span> {device.hardware.manufacturer}</p>
                    <p><span className="text-slate-400">Model Name:</span> {device.hardware.model}</p>
                    <p><span className="text-slate-400">Serial Number:</span> {device.serialNumber}</p>
                    <p><span className="text-slate-400">Battery Level:</span> {device.hardware.batteryLevel ? `${device.hardware.batteryLevel}%` : 'AC Powered'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SOFTWARE TAB */}
          {activeTab === 'software' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Installed Applications Inventory ({device.installedApps.length})
                </h4>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
                    <tr>
                      <th className="px-4 py-2.5">Application Name</th>
                      <th className="px-4 py-2.5">Publisher</th>
                      <th className="px-4 py-2.5">Version</th>
                      <th className="px-4 py-2.5">Catalog Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {device.installedApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-800/50">
                        <td className="px-4 py-2.5 font-medium text-slate-200">{app.name}</td>
                        <td className="px-4 py-2.5 text-slate-400">{app.publisher}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-300">{app.version}</td>
                        <td className="px-4 py-2.5">
                          {app.isProhibited ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Prohibited
                            </span>
                          ) : app.isApproved ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-300">
                              Uncataloged
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. POLICIES TAB */}
          {activeTab === 'policies' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Active Policy Baseline ({appliedPolicies.length})
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {appliedPolicies.map(policy => (
                  <div key={policy.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-200">{policy.name}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold uppercase">
                          {policy.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{policy.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                        Effective & Enforced
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">v{policy.version} • Priority {policy.priority}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. COMPLIANCE TAB */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Zero-Trust Compliance Assessment
              </h4>
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  device.isEncrypted ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}>
                  <div>
                    <h5 className="text-xs font-bold">Storage Volume Encryption Check</h5>
                    <p className="text-xs mt-0.5 opacity-80">Full disk encryption baseline (BitLocker / FileVault / LUKS)</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-black/30">
                    {device.isEncrypted ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  device.antivirusActive ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}>
                  <div>
                    <h5 className="text-xs font-bold">Active EDR / Antivirus Sensor</h5>
                    <p className="text-xs mt-0.5 opacity-80">Endpoint threat telemetry protection sensor check</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-black/30">
                    {device.antivirusActive ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  !device.installedApps.some(a => a.isProhibited) ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                }`}>
                  <div>
                    <h5 className="text-xs font-bold">Prohibited Software Prohibition Scan</h5>
                    <p className="text-xs mt-0.5 opacity-80">Ensures no blacklisted P2P torrent or unsanctioned tools exist</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-black/30">
                    {!device.installedApps.some(a => a.isProhibited) ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 6. COMMANDS TAB */}
          {activeTab === 'commands' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Historical & Queued Commands ({deviceCommands.length})
              </h4>
              <div className="space-y-2">
                {deviceCommands.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No commands dispatched yet.</p>
                ) : (
                  deviceCommands.map(cmd => (
                    <div key={cmd.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold font-mono text-slate-200">{cmd.action.toUpperCase()}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          cmd.status === 'Succeeded' ? 'bg-emerald-500/20 text-emerald-400' :
                          cmd.status === 'Failed' ? 'bg-rose-500/20 text-rose-400' :
                          cmd.status === 'Running' ? 'bg-indigo-500/20 text-indigo-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {cmd.status}
                        </span>
                      </div>
                      <p className="text-slate-400">{cmd.result || cmd.executionLog || 'In execution queue...'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Requested by {cmd.requestedBy} • {new Date(cmd.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 7. ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Security & Administrative Audit Trail ({deviceAudits.length})
              </h4>
              <div className="space-y-2">
                {deviceAudits.map(audit => (
                  <div key={audit.id} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{audit.action}</span>
                      <span className="text-[10px] text-slate-400">{new Date(audit.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{audit.details}</p>
                    <span className="text-[10px] text-indigo-400 mt-1 block">Actor: {audit.actorEmail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. ASSIGNED USER TAB */}
          {activeTab === 'user' && (
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/60 max-w-lg space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-base font-bold">
                  {device.assignedUser.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{device.assignedUser}</h4>
                  <p className="text-slate-400">{device.assignedUserEmail}</p>
                </div>
              </div>
              <div className="border-t border-slate-700/60 pt-3 space-y-2 text-slate-300">
                <p><span className="text-slate-400">Department:</span> {device.department}</p>
                <p><span className="text-slate-400">Primary Branch:</span> {device.branch}</p>
                <p><span className="text-slate-400">Device Ownership:</span> Corporate Owned, Personally Enabled (COPE)</p>
              </div>
            </div>
          )}

          {/* 9. DEPLOYMENTS TAB */}
          {activeTab === 'deployments' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Software Deployment Pipeline
              </h4>
              <div className="space-y-3">
                {deviceDeployments.length === 0 ? (
                  <p className="text-xs text-slate-400">No active ring deployments targeted to this endpoint.</p>
                ) : (
                  deviceDeployments.map(dep => (
                    <div key={dep.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-slate-200">{dep.packageName} ({dep.version})</h5>
                        <p className="text-slate-400">Rollout Ring: {dep.ring}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                        {dep.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
