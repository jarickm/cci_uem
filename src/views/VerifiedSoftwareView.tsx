import React, { useState } from 'react';
import { 
  CheckCircle2, Search, Play, Download, ShieldCheck, 
  ExternalLink, Layers, ArrowUpRight, Terminal, Copy, Check 
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { VerifiedSoftware } from '../types/uem';

export const VerifiedSoftwareView: React.FC = () => {
  const { verifiedSoftware, deviceGroups, deployVerifiedSoftware } = useUEM();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSoftware, setSelectedSoftware] = useState<VerifiedSoftware | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState(deviceGroups[0]?.id || '');
  const [selectedRing, setSelectedRing] = useState<'Pilot' | 'Ring 1 (Staged)' | 'Ring 2 (Broad)' | 'Production'>('Ring 1 (Staged)');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [deploySuccess, setDeploySuccess] = useState(false);

  const categories = ['all', 'Cold Chain IoT', 'Industrial Automation', 'Web Browsers', 'Developer Tools', 'Endpoint Security', 'Productivity & Comms', 'Security & Identity', 'Network & Security'];

  const filtered = verifiedSoftware.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.publisher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.packageId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoftware) return;

    await deployVerifiedSoftware(selectedSoftware.id, selectedGroupId, selectedRing);
    setDeploySuccess(true);
    setTimeout(() => {
      setDeploySuccess(false);
      setSelectedSoftware(null);
    }, 1500);
  };

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Verified Software & Package Catalog</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Official Registries: Winget / Homebrew / APT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curated, cryptographically signed corporate software packages ready for one-click silent deployment to managed endpoints
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search verified software by name, publisher, or Winget ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === cat 
                  ? 'bg-indigo-600 text-white font-semibold' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Verified Packages' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Software Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(pkg => (
          <div key={pkg.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-100 text-sm">{pkg.name}</h3>
                    <span title="Verified Publisher Signature">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{pkg.publisher} • v{pkg.version}</p>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {pkg.source}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{pkg.description}</p>

              {/* Package Metadata Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                <p className="truncate"><strong className="text-slate-300">Package ID:</strong> {pkg.packageId}</p>
                <p className="truncate"><strong className="text-slate-300">SHA-256:</strong> {pkg.hashSha256}</p>
              </div>

              {/* Silent Install Command Snippet */}
              <div className="relative">
                <pre className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-indigo-300 whitespace-pre-wrap truncate pr-8">
                  {pkg.silentInstallCmd}
                </pre>
                <button
                  onClick={() => copyToClipboard(pkg.silentInstallCmd)}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
                  title="Copy Silent Command"
                >
                  {copiedCmd === pkg.silentInstallCmd ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Deploy Trigger Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <a
                href={pkg.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Official Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setSelectedSoftware(pkg)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Deploy to Fleet</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deployment Ring Modal */}
      {selectedSoftware && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Deploy Verified Software</h3>
                <p className="text-[11px] text-slate-400">{selectedSoftware.name} (v{selectedSoftware.version})</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                Verified Publisher
              </span>
            </div>

            <form onSubmit={handleDeploy} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Endpoint Group</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  {deviceGroups.map(grp => (
                    <option key={grp.id} value={grp.id}>
                      {grp.name} ({grp.deviceCount} Endpoints)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Staged Rollout Ring</label>
                <select
                  value={selectedRing}
                  onChange={(e) => setSelectedRing(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="Pilot">Pilot (Canary test endpoints - 5%)</option>
                  <option value="Ring 1 (Staged)">Ring 1 - Staged Fleet (25%)</option>
                  <option value="Ring 2 (Broad)">Ring 2 - Broad Fleet (75%)</option>
                  <option value="Production">Production (Immediate 100% organization rollout)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <p className="font-semibold text-slate-300">Execution Handshake:</p>
                <p className="text-slate-400 font-mono">{selectedSoftware.silentInstallCmd}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                {deploySuccess ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Deployment ring scheduled!
                  </span>
                ) : <span />}
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSoftware(null)}
                    className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-md shadow-indigo-600/30"
                  >
                    Confirm & Dispatch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
