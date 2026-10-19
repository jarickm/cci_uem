import React, { useState } from 'react';
import { Package, Plus, ShieldCheck, Download, Clock, Play, FileCode, CheckCircle2 } from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { Platform } from '../types/uem';

export const SoftwarePackagesView: React.FC = () => {
  const { packages, deployments, createPackage, createDeployment, deviceGroups } = useUEM();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || '');

  // Form states for new package
  const [name, setName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [version, setVersion] = useState('');
  const [platform, setPlatform] = useState<Platform>('windows');
  const [hashSha256, setHashSha256] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [installArgs, setInstallArgs] = useState('/qn /norestart');
  const [uninstallArgs, setUninstallArgs] = useState('/qn /x');

  // Form states for new deployment
  const [selectedRing, setSelectedRing] = useState<'Pilot' | 'Ring 1 (Staged)' | 'Ring 2 (Broad)' | 'Production'>('Pilot');
  const [selectedGroupId, setSelectedGroupId] = useState(deviceGroups[0]?.id || '');

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !version) return;

    await createPackage({
      orgId: 'org-apex-01',
      name,
      publisher: publisher || 'Enterprise Publisher',
      version,
      platform,
      architecture: 'x64',
      hashSha256: hashSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fileSizeBytes: 65000000,
      downloadUrl: downloadUrl || 'https://storage.googleapis.com/apex-uem-packages/pkg.msi',
      installArguments: installArgs,
      uninstallArguments: uninstallArgs,
      approvalStatus: 'approved',
    });

    setShowUploadModal(false);
    setName('');
    setVersion('');
  };

  const handleDeploySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find(p => p.id === selectedPackageId);
    if (!pkg) return;

    await createDeployment({
      orgId: 'org-apex-01',
      packageId: pkg.id,
      packageName: pkg.name,
      version: pkg.version,
      targetGroupIds: [selectedGroupId],
      targetDeviceIds: ['dev-win-01', 'dev-win-02'],
      ring: selectedRing,
      status: 'InProgress',
      totalDevices: 2,
      scheduledAt: new Date().toISOString(),
    });

    setShowDeployModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Software Package Repository & Deployment Rings</h1>
          <p className="text-xs text-slate-400">
            Validated corporate software binaries with SHA-256 integrity verification and staged rollout rings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowDeployModal(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            <span>Launch Deployment Ring</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Software Package</span>
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{pkg.name}</h3>
                  <p className="text-[11px] text-slate-400">{pkg.publisher} • v{pkg.version}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                {pkg.approvalStatus}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[10px] space-y-1 border border-slate-800 text-slate-400">
              <p className="truncate"><strong className="text-slate-300">SHA-256:</strong> {pkg.hashSha256}</p>
              <p><strong className="text-slate-300">Platform:</strong> {pkg.platform} ({pkg.architecture})</p>
              <p><strong className="text-slate-300">Silent Args:</strong> {pkg.installArguments}</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">{(pkg.fileSizeBytes / 1000000).toFixed(1)} MB</span>
              <button
                onClick={() => {
                  setSelectedPackageId(pkg.id);
                  setShowDeployModal(true);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Deploy Ring</span>
                <Play className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Deployments Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Active Staged Deployments ({deployments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Package Name</th>
                <th className="px-4 py-3">Rollout Ring</th>
                <th className="px-4 py-3">Target Fleet</th>
                <th className="px-4 py-3">Success Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Initiated Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {deployments.map(dep => (
                <tr key={dep.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-100">{dep.packageName} ({dep.version})</td>
                  <td className="px-4 py-3 font-medium text-indigo-400">{dep.ring}</td>
                  <td className="px-4 py-3 text-slate-400">{dep.totalDevices} Endpoints</td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-semibold">{dep.succeededCount} Pass</span>
                    {dep.failedCount > 0 && <span className="text-rose-400 ml-2">{dep.failedCount} Fail</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      dep.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                    {new Date(dep.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Register Managed Package</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1Password 8 Enterprise"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Version</label>
                  <input
                    type="text"
                    required
                    placeholder="8.10.40"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  >
                    <option value="windows">Windows (MSI/EXE)</option>
                    <option value="macos">macOS (PKG/DMG)</option>
                    <option value="linux">Linux (DEB/RPM)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">SHA-256 Hash Verification</label>
                <input
                  type="text"
                  placeholder="64-character SHA-256 cryptographic digest"
                  value={hashSha256}
                  onChange={(e) => setHashSha256(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Silent Install Arguments</label>
                <input
                  type="text"
                  value={installArgs}
                  onChange={(e) => setInstallArgs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 font-mono text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-2 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 font-semibold text-white"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deploy Ring Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Configure Deployment Rollout Ring</h3>
            <form onSubmit={handleDeploySubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Select Software Package</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.version})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Deployment Ring Stage</label>
                <select
                  value={selectedRing}
                  onChange={(e) => setSelectedRing(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  <option value="Pilot">Pilot (5% canary endpoints)</option>
                  <option value="Ring 1 (Staged)">Ring 1 - Staged (25% fleet)</option>
                  <option value="Ring 2 (Broad)">Ring 2 - Broad (75% fleet)</option>
                  <option value="Production">Production (100% organization-wide)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeployModal(false)}
                  className="px-3 py-2 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 font-semibold text-white"
                >
                  Start Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
