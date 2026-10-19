import React from 'react';
import { 
  Laptop, ShieldAlert, CheckCircle2, Clock, AlertTriangle, 
  Terminal, Package, RefreshCw, ArrowUpRight, ArrowDownRight, 
  ShieldCheck, MonitorCheck
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { NavView } from '../components/layout/Sidebar';

interface OverviewViewProps {
  onNavigate: (view: NavView) => void;
  onSelectDevice: (deviceId: string) => void;
  onOpenEnroll: () => void;
  onOpenCommand: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ 
  onNavigate, 
  onSelectDevice,
  onOpenEnroll,
  onOpenCommand
}) => {
  const { devices, securityAlerts, commands, policies, packages, syncAllHeartbeats } = useUEM();

  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.status === 'Active').length;
  const noncompliantDevices = devices.filter(d => d.complianceStatus === 'Fail').length;
  const pendingCommands = commands.filter(c => c.status === 'Pending' || c.status === 'Queued').length;
  const openAlerts = securityAlerts.filter(a => a.status === 'Open').length;

  // Platform breakdown
  const winCount = devices.filter(d => d.platform === 'windows').length;
  const macCount = devices.filter(d => d.platform === 'macos').length;
  const lnxCount = devices.filter(d => d.platform === 'linux').length;
  const mobCount = devices.filter(d => d.platform === 'android' || d.platform === 'ios').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Coolaire Consolidated Inc. (CCI) Fleet</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Fleet Healthy (94.2%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Real-time telemetry, automated zero-trust compliance, BitLocker encryption escrow, and centralized software deployment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenEnroll}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>+ Enroll Device</span>
          </button>
          <button
            onClick={onOpenCommand}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dispatch Action</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div 
          onClick={() => onNavigate('devices')} 
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Enrolled</span>
            <Laptop className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">{totalDevices}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Cross-platform endpoints</span>
        </div>

        <div 
          onClick={() => onNavigate('devices')} 
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active & Online</span>
            <MonitorCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{activeDevices}</div>
          <span className="text-[10px] text-emerald-500/80 mt-1 block">Reporting heartbeats</span>
        </div>

        <div 
          onClick={() => onNavigate('compliance')} 
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Noncompliant</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{noncompliantDevices}</div>
          <span className="text-[10px] text-rose-400/80 mt-1 block">Requires remediation</span>
        </div>

        <div 
          onClick={() => onNavigate('remote_actions')} 
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Jobs</span>
            <Terminal className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{pendingCommands}</div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">Queued remote commands</span>
        </div>

        <div 
          onClick={() => onNavigate('alerts')} 
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Threat Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{openAlerts}</div>
          <span className="text-[10px] text-rose-400/80 mt-1 block">Active security warnings</span>
        </div>
      </div>

      {/* Grid: OS Fleet Distribution & Quick Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Fleet Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">OS Fleet Composition</h3>
            <span className="text-[10px] text-slate-400">5 Platforms</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Windows 11 / 10 Enterprise</span>
                <span className="font-mono text-slate-400">{winCount} ({Math.round((winCount/totalDevices)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(winCount/totalDevices)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>macOS Sequoia & Sonoma</span>
                <span className="font-mono text-slate-400">{macCount} ({Math.round((macCount/totalDevices)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(macCount/totalDevices)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Linux Workstations & Edge</span>
                <span className="font-mono text-slate-400">{lnxCount} ({Math.round((lnxCount/totalDevices)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(lnxCount/totalDevices)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Mobile (Android & iOS MDM)</span>
                <span className="font-mono text-slate-400">{mobCount} ({Math.round((mobCount/totalDevices)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(mobCount/totalDevices)*100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Security Alerts Stream */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Security Alerts</h3>
            <button 
              onClick={() => onNavigate('alerts')}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {securityAlerts.map(alert => (
              <div key={alert.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-300">{alert.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">
                      {alert.deviceHostname}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{alert.description}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-rose-500/20 text-rose-400 shrink-0">
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Devices Quick Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recent Managed Endpoints</h3>
            <p className="text-[11px] text-slate-400">Click any row to inspect complete 9-tab hardware and software telemetry</p>
          </div>
          <button 
            onClick={() => onNavigate('devices')}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
          >
            <span>Full Inventory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-2.5">Device Hostname</th>
                <th className="px-4 py-2.5">Platform</th>
                <th className="px-4 py-2.5">Assigned User</th>
                <th className="px-4 py-2.5">Department</th>
                <th className="px-4 py-2.5">Encryption</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {devices.map(device => (
                <tr 
                  key={device.id} 
                  onClick={() => onSelectDevice(device.id)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-slate-200">{device.hostname}</td>
                  <td className="px-4 py-3 capitalize">{device.platform}</td>
                  <td className="px-4 py-3">{device.assignedUser}</td>
                  <td className="px-4 py-3 text-slate-400">{device.department}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      device.isEncrypted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {device.isEncrypted ? 'Encrypted' : 'Unencrypted'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      device.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    {new Date(device.lastCheckIn).toLocaleTimeString()}
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
