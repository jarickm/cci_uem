import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Terminal, Laptop, ShieldCheck } from 'lucide-react';
import { Platform } from '../../types/uem';
import { useUEM } from '../../context/UEMContext';

interface EnrollDeviceModalProps {
  onClose: () => void;
}

export const EnrollDeviceModal: React.FC<EnrollDeviceModalProps> = ({ onClose }) => {
  const { createEnrollmentToken, createDevice, organization } = useUEM();
  const [platform, setPlatform] = useState<Platform>('windows');
  const [department, setDepartment] = useState('Engineering');
  const [branch, setBranch] = useState('New York HQ');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleGenerate = async () => {
    const tokenObj = await createEnrollmentToken(platform, department, branch, 50);
    setGeneratedToken(tokenObj.token);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateLiveEnrollment = async () => {
    setIsSimulating(true);
    const sn = `SN-${Math.floor(100000 + Math.random() * 900000)}`;
    const hostname = platform === 'windows' ? `APX-W11-${sn.substring(3, 7)}` :
      platform === 'macos' ? `APX-MBP-${sn.substring(3, 7)}` :
      platform === 'linux' ? `apx-srv-${sn.substring(3, 7)}` :
      platform === 'android' ? `APX-TAB-${sn.substring(3, 7)}` : `APX-IPH-${sn.substring(3, 7)}`;

    await createDevice({
      hostname,
      platform,
      department,
      branch,
      assignedUser: `New Onboard (${department})`,
      assignedUserEmail: `onboard.${sn.toLowerCase()}@apex-global.com`,
      serialNumber: sn,
      status: 'Active',
      complianceStatus: 'Pass',
    });
    setIsSimulating(false);
    onClose();
  };

  const getAgentCommand = () => {
    const token = generatedToken || 'APEX-WIN-TOKEN-SAMPLE';
    if (platform === 'windows') {
      return `powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '${window.location.origin}/agent/windows/VanguardAgent.ps1' -OutFile '$env:TEMP\\VanguardAgent.ps1'; & '$env:TEMP\\VanguardAgent.ps1' -EnrollmentToken '${token}'"`;
    } else if (platform === 'macos') {
      return `curl -sSL ${window.location.origin}/agent/macos/install.sh | sudo bash -s -- --token "${token}"`;
    } else if (platform === 'linux') {
      return `curl -sSL ${window.location.origin}/agent/linux/install.sh | sudo bash -s -- --token "${token}"`;
    } else {
      return `Open Vanguard MDM App -> Enter Organization ID: ${organization.id} -> Enter Token: ${token}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Enroll New Enterprise Endpoint</h3>
              <p className="text-[11px] text-slate-400">Generate time-bound token and onboard endpoints</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Platform Selector */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Target Operating System</label>
            <div className="grid grid-cols-5 gap-2">
              {(['windows', 'macos', 'linux', 'android', 'ios'] as Platform[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPlatform(p); setGeneratedToken(null); }}
                  className={`py-2 px-3 rounded-lg font-semibold uppercase text-[10px] border transition-all ${
                    platform === p
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p}
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

          {/* Token Box */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Enrollment Token</span>
              {!generatedToken ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                >
                  Generate Token
                </button>
              ) : (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Active (Expires in 7 days)
                </span>
              )}
            </div>

            {generatedToken && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-indigo-300 text-xs">
                  <span>{generatedToken}</span>
                  <button
                    onClick={() => copyToClipboard(generatedToken)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy token"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 text-[11px] mb-1">
                    Endpoint Onboarding One-Liner Command:
                  </label>
                  <div className="relative">
                    <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto">
                      {getAgentCommand()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(getAgentCommand())}
                      className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={simulateLiveEnrollment}
              disabled={isSimulating}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium border border-slate-700/60 text-xs transition-colors"
            >
              {isSimulating ? 'Connecting...' : 'Test Instant Device Handshake'}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
