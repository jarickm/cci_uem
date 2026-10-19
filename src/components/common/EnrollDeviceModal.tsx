import React, { useState } from 'react';
import { 
  X, QrCode, Copy, Check, Terminal, Laptop, 
  ShieldCheck, Download, Smartphone, Apple, MonitorCheck 
} from 'lucide-react';
import { Platform } from '../../types/uem';
import { useUEM } from '../../context/UEMContext';

interface EnrollDeviceModalProps {
  onClose: () => void;
}

export const EnrollDeviceModal: React.FC<EnrollDeviceModalProps> = ({ onClose }) => {
  const { createEnrollmentToken, createDevice, organization } = useUEM();
  const [platform, setPlatform] = useState<Platform>('windows');
  const [department, setDepartment] = useState(organization.departments[0] || 'Cold Chain Logistics & Reefer Fleet');
  const [branch, setBranch] = useState(organization.branches[0] || 'Pasig Main Plant & Corporate HQ');
  const [generatedToken, setGeneratedToken] = useState<string>('CCI-WIN-CORP-FLEET-2026');
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    const tokenObj = await createEnrollmentToken(platform, department, branch, 50);
    setGeneratedToken(tokenObj.token);
  };

  const runLiveWebAgent = async () => {
    setIsSimulating(true);
    const userAgent = navigator.userAgent;
    const isMac = userAgent.includes('Mac');
    const isWin = userAgent.includes('Windows');
    const detectedPlatform: Platform = isWin ? 'windows' : isMac ? 'macos' : 'linux';

    const devHostname = `WEB-${detectedPlatform.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    await createDevice({
      hostname: devHostname,
      platform: detectedPlatform,
      osVersion: `${detectedPlatform === 'windows' ? 'Windows 11' : detectedPlatform === 'macos' ? 'macOS Sequoia' : 'Linux'} (Web Agent Engine)`,
      osBuild: '22631.WebRunner',
      architecture: 'x64',
      assignedUser: 'Live Local Session Admin',
      assignedUserEmail: 'jmmontojo2019@gmail.com',
      department,
      branch,
      status: 'Active',
      complianceStatus: 'Pass',
      ipAddress: '127.0.0.1 (Local Gateway)',
      macAddress: 'F2:A0:C3:99:88:77',
      agentVersion: 'v2.6.4-web-agent',
      isEncrypted: true,
      firewallEnabled: true,
      antivirusActive: true,
      location: {
        latitude: 14.5842,
        longitude: 121.0825,
        accuracyMeters: 5,
        address: 'Coolaire Main Plant Operator Station, Pasig City',
        insideGeofence: true,
        activeGeofenceName: 'CCI Pasig Main Plant & Corporate HQ',
        temperatureCelsius: 22.5,
        speedKmh: 0,
        cargoStatus: 'Live Web Agent Workstation',
        lastUpdated: new Date().toISOString(),
      },
      hardware: {
        cpu: `${navigator.hardwareConcurrency || 8}-Core Local Host Processor`,
        cores: navigator.hardwareConcurrency || 8,
        memoryGb: 16,
        storageTotalGb: 512,
        storageAvailableGb: 320,
        macAddress: 'F2:A0:C3:99:88:77',
        ipAddress: '127.0.0.1',
        manufacturer: 'Workstation Host',
        model: 'Standard Enterprise PC',
      },
    });

    setIsSimulating(false);
    setSimulatedSuccess(true);
    setTimeout(() => {
      setSimulatedSuccess(false);
      onClose();
    }, 1500);
  };

  const getAgentCommand = () => {
    const origin = window.location.origin;
    if (platform === 'windows') {
      return `powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '${origin}/api/agent/installer/windows?token=${generatedToken}' -OutFile '$env:TEMP\\VanguardAgent.ps1'; & '$env:TEMP\\VanguardAgent.ps1' -EnrollmentToken '${generatedToken}'"`;
    } else if (platform === 'macos') {
      return `curl -sSL "${origin}/api/agent/installer/macos?token=${generatedToken}" | sudo bash`;
    } else if (platform === 'linux') {
      return `curl -sSL "${origin}/api/agent/installer/linux?token=${generatedToken}" | sudo bash`;
    } else if (platform === 'ios') {
      return `Download Apple MDM Profile: ${origin}/api/agent/mobileconfig`;
    } else {
      return `Android Enterprise Token: ${generatedToken} (Scan QR Code in Setup Wizard)`;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in text-xs">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Enterprise Endpoint Agent Onboarding</h3>
              <p className="text-[11px] text-slate-400">Deploy native management agents across Computers and Mobile devices</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Platform Selector Buttons */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Select Endpoint Architecture</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'windows', label: 'Windows PC' },
                { id: 'macos', label: 'macOS Mac' },
                { id: 'linux', label: 'Linux OS' },
                { id: 'android', label: 'Android Phone' },
                { id: 'ios', label: 'Apple iOS' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id as Platform)}
                  className={`py-2 px-2 rounded-lg font-semibold text-[11px] border transition-all text-center ${
                    platform === p.id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                {organization.departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Assigned Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                {organization.branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Platform Specific Agent Installer Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                {platform === 'windows' ? 'Windows 11/10 PowerShell Installer' :
                 platform === 'macos' ? 'macOS Sequoia/Sonoma Installer' :
                 platform === 'linux' ? 'Linux Systemd Daemon Script' :
                 platform === 'android' ? 'Android Enterprise Zero-Touch QR Code' : 'Apple MDM Mobileconfig Profile'}
              </span>
              <span className="font-mono text-indigo-400 font-bold text-[11px]">{generatedToken}</span>
            </div>

            {/* Android QR Code View */}
            {platform === 'android' && (
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-4">
                <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center shrink-0">
                  {/* Simulated QR Code SVG */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v4h-4v-4zm-6 2h4v2h-4v-2zm4 4h4v2h-4v-2zm-6 2h2v2h-2v-2z" />
                  </svg>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <p className="font-bold text-white">Android Enterprise Work Profile</p>
                  <p className="text-slate-400">
                    Tap the welcome screen 6 times during factory setup and scan this QR code to provision corporate work container.
                  </p>
                </div>
              </div>
            )}

            {/* Apple MDM Download Button */}
            {platform === 'ios' && (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-[11px]">Over-The-Air (OTA) Configuration Profile</p>
                  <p className="text-slate-400 text-[10px]">Install profile in iOS Settings -&gt; Profile Downloaded</p>
                </div>
                <a
                  href="/api/agent/mobileconfig"
                  download="VanguardEnrollment.mobileconfig"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .mobileconfig</span>
                </a>
              </div>
            )}

            {/* PowerShell / Bash Command Snippet */}
            {(platform === 'windows' || platform === 'macos' || platform === 'linux') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Run on target device terminal as Administrator:
                </label>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 whitespace-pre-wrap overflow-x-auto pr-9">
                    {getAgentCommand()}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(getAgentCommand())}
                    className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded"
                    title="Copy command"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Web Agent Runner */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-indigo-200">Run Live Agent In This Browser</h4>
              <p className="text-slate-400 text-[11px]">
                Immediately registers your current machine/browser into Vanguard UEM with real live telemetry!
              </p>
            </div>
            <button
              type="button"
              onClick={runLiveWebAgent}
              disabled={isSimulating}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <MonitorCheck className="w-4 h-4" />
              <span>{isSimulating ? 'Connecting Agent...' : 'Launch Live Web Agent'}</span>
            </button>
          </div>

          {simulatedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Machine enrolled successfully! Real-time telemetry reporting to dashboard.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
