import React, { useState } from 'react';
import { 
  QrCode, Plus, Copy, Check, Shield, 
  Terminal, Laptop, AlertCircle, Trash2, Key, 
  Upload, Layers, Download, FileSpreadsheet, Smartphone, Zap 
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { Platform } from '../types/uem';
import { BulkEnrollmentModal } from '../components/common/BulkEnrollmentModal';

interface EnrollmentViewProps {
  onOpenEnrollModal: () => void;
  onOpenBulkModal?: () => void;
}

export const EnrollmentView: React.FC<EnrollmentViewProps> = ({ onOpenEnrollModal, onOpenBulkModal }) => {
  const { enrollmentTokens, revokeEnrollmentToken, organization } = useUEM();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showInternalBulkModal, setShowInternalBulkModal] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleOpenBulk = () => {
    if (onOpenBulkModal) {
      onOpenBulkModal();
    } else {
      setShowInternalBulkModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Device Enrollment & Onboarding</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
              {organization.name}
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Generate time-bounded enrollment tokens, launch CSV bulk fleet provisioning, or deploy native agents
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenBulk}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Launch Bulk Enrollment</span>
          </button>
          
          <button
            onClick={onOpenEnrollModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Single Invitation</span>
          </button>
        </div>
      </div>

      {/* Cross-Platform Onboarding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        {/* Windows Agent Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                W
              </div>
              <div>
                <h3 className="font-bold text-slate-200">Windows 11 / 10</h3>
                <p className="text-[11px] text-slate-400">PowerShell & GPO Batch</p>
              </div>
            </div>
            <p className="text-slate-400 text-[11px]">
              Installs SYSTEM background service, enforces BitLocker XTS-256 encryption, and scans Windows Update KB bulletins.
            </p>
          </div>
          <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
            powershell -ExecutionPolicy Bypass -File .\VanguardAgent.ps1 -Token &lt;TOKEN&gt;
          </div>
        </div>

        {/* Android Enterprise Cold Chain */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h3 className="font-bold text-slate-200">Android Cold Chain</h3>
                <p className="text-[11px] text-slate-400">Zero-Touch & Knox DPC</p>
              </div>
            </div>
            <p className="text-slate-400 text-[11px]">
              Kiosk enrollment for refrigerated delivery truck tablets. Continuous Bluetooth & MQTT temp datalogging.
            </p>
          </div>
          <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
            afw#cci-coldtrace-uem (or scan QR code)
          </div>
        </div>

        {/* macOS MDM Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <h3 className="font-bold text-slate-200">macOS Sequoia / Sonoma</h3>
                <p className="text-[11px] text-slate-400">Apple MDM & FileVault</p>
              </div>
            </div>
            <p className="text-slate-400 text-[11px]">
              Installs configuration profile for FileVault recovery key escrow, Gatekeeper, and root certificate deployment.
            </p>
          </div>
          <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
            sudo profiles install -path enroll.mobileconfig
          </div>
        </div>

        {/* Linux Telemetry Server */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                L
              </div>
              <div>
                <h3 className="font-bold text-slate-200">Linux IoT Gateways</h3>
                <p className="text-[11px] text-slate-400">Systemd Service Daemon</p>
              </div>
            </div>
            <p className="text-slate-400 text-[11px]">
              Continuous telemetry collection for Pasig plant MQTT brokers, cold rooms, and industrial chillers.
            </p>
          </div>
          <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 break-all border border-slate-800">
            curl -sSL https://uem.coolaire.com.ph/install.sh | sudo bash
          </div>
        </div>
      </div>

      {/* Bulk Fleet Enrollment Quick Access Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Need to Enroll Multiple Endpoints at Once?</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Use our CSV batch importer to upload up to 500 refrigerated delivery tablets, field laptops, or engineering workstations in seconds.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenBulk}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 shrink-0 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Open Bulk Fleet Importer</span>
        </button>
      </div>

      {/* 24/7 Auto-Start Architecture Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>24/7 Persistent Auto-Start Service Configuration</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  ALL PLATFORMS SUPPORTED
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Guarantees endpoint connectivity and cold-chain telematics by launching before user login on system boot
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Auto-restart watchdog enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Windows Service */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400">Windows 11 / 10 Service</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">sc.exe</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Installs Win32 System Service (<code className="text-slate-200">CCIAgent</code>) configured with <code className="text-slate-200">start= auto</code> running under NT AUTHORITY\SYSTEM.
            </p>
            <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 border border-slate-800">
              sc.exe create "CCIAgent" binPath= "...\CCIAgent.exe --daemon" start= auto
            </div>
          </div>

          {/* Android Mobile */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">Android Reefer Tablets</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">Knox DPC</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Registered with <code className="text-slate-200">RECEIVE_BOOT_COMPLETED</code> broadcast receiver and persistent foreground notification.
            </p>
            <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 border border-slate-800">
              intent-filter: android.intent.action.BOOT_COMPLETED
            </div>
          </div>

          {/* macOS LaunchDaemon */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-400">macOS LaunchDaemon</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">plist</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Loaded into <code className="text-slate-200">/Library/LaunchDaemons</code> with <code className="text-slate-200">RunAtLoad=true</code> and <code className="text-slate-200">KeepAlive=true</code>.
            </p>
            <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 border border-slate-800">
              sudo launchctl bootstrap system .../com.coolaire.uem.agent.plist
            </div>
          </div>

          {/* Linux Systemd */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400">Linux / Ubuntu Systemd</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">systemctl</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Configured under <code className="text-slate-200">multi-user.target</code> with automated crash restart (<code className="text-slate-200">Restart=always</code>).
            </p>
            <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 border border-slate-800">
              sudo systemctl enable --now cci-uem-agent.service
            </div>
          </div>
        </div>
      </div>

      {/* Active Enrollment Tokens Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Corporate Enrollment Tokens ({enrollmentTokens.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Tokens automatically expire after 7 days</span>
        </div>

        {enrollmentTokens.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <QrCode className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No active enrollment tokens</p>
            <p className="text-xs text-slate-400 mt-1">Create a new token or use the bulk importer to onboard fleet devices</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Token Code</th>
                  <th className="p-3 font-semibold">Target Platform</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Assigned Branch</th>
                  <th className="p-3 font-semibold">Redemption Status</th>
                  <th className="p-3 font-semibold">Expires At</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {enrollmentTokens.map(tok => (
                  <tr key={tok.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-100 flex items-center gap-2">
                      <span>{tok.token}</span>
                      <button
                        onClick={() => copyText(tok.token)}
                        className="text-slate-400 hover:text-white"
                        title="Copy token"
                      >
                        {copiedToken === tok.token ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        tok.platform === 'windows' ? 'bg-blue-500/20 text-blue-400' :
                        tok.platform === 'android' ? 'bg-emerald-500/20 text-emerald-400' :
                        tok.platform === 'macos' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {tok.platform}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-200">{tok.department}</td>
                    <td className="p-3 text-slate-400">{tok.branch}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${(tok.usedCount / tok.maxUses) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {tok.usedCount}/{tok.maxUses}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{tok.expiresAt.substring(0, 10)}</td>
                    <td className="p-3 text-right">
                      {tok.status === 'active' ? (
                        <button
                          onClick={() => revokeEnrollmentToken(tok.id)}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium text-[11px] border border-rose-500/20"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-slate-500 font-medium text-[11px]">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Internal Bulk Modal Fallback */}
      {showInternalBulkModal && (
        <BulkEnrollmentModal onClose={() => setShowInternalBulkModal(false)} />
      )}
    </div>
  );
};
