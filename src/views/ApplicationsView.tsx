import React, { useState } from 'react';
import { Layers2, CheckCircle2, Ban, Search, Laptop, ShieldCheck } from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { SoftwareApp } from '../types/uem';

export const ApplicationsView: React.FC = () => {
  const { devices } = useUEM();
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'approved' | 'prohibited'>('all');

  // Aggregated software list across all endpoints
  const allDiscoveredApps = React.useMemo(() => {
    const appMap = new Map<string, { app: SoftwareApp; installedCount: number; devicesList: string[] }>();
    
    devices.forEach(d => {
      d.installedApps.forEach(app => {
        const key = `${app.name.toLowerCase()}-${app.publisher.toLowerCase()}`;
        if (!appMap.has(key)) {
          appMap.set(key, { app, installedCount: 1, devicesList: [d.hostname] });
        } else {
          const entry = appMap.get(key)!;
          entry.installedCount += 1;
          entry.devicesList.push(d.hostname);
        }
      });
    });

    return Array.from(appMap.values());
  }, [devices]);

  const filtered = allDiscoveredApps.filter(({ app }) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.publisher.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCatalog = 
      catalogFilter === 'all' ||
      (catalogFilter === 'approved' && app.isApproved && !app.isProhibited) ||
      (catalogFilter === 'prohibited' && app.isProhibited);

    return matchesSearch && matchesCatalog;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Discovered Application Catalog</h1>
          <p className="text-xs text-slate-400">
            Real-time installed software inventory detected by endpoint agents with approval and ban policies
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search software catalog or publisher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCatalogFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              catalogFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            All Software ({allDiscoveredApps.length})
          </button>
          <button
            onClick={() => setCatalogFilter('approved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              catalogFilter === 'approved' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Sanctioned / Approved
          </button>
          <button
            onClick={() => setCatalogFilter('prohibited')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              catalogFilter === 'prohibited' ? 'bg-rose-600 text-white font-semibold' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Prohibited Blacklist
          </button>
        </div>
      </div>

      {/* Software Catalog Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Software Title</th>
                <th className="px-4 py-3">Publisher</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Installed Fleet Count</th>
                <th className="px-4 py-3">Catalog Status</th>
                <th className="px-4 py-3">Installed Endpoints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(({ app, installedCount, devicesList }) => (
                <tr key={`${app.name}-${app.publisher}`} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-100 flex items-center gap-2">
                    <Layers2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{app.name}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{app.publisher}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{app.version}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-200">
                    {installedCount} {installedCount === 1 ? 'device' : 'devices'}
                  </td>
                  <td className="px-4 py-3">
                    {app.isProhibited ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Prohibited Blacklist
                      </span>
                    ) : app.isApproved ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Sanctioned Corporate App
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-300">
                        Under Review
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {devicesList.join(', ')}
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
