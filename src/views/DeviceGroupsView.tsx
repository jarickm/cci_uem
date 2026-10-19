import React, { useState } from 'react';
import { Layers, Plus, Laptop, Filter, Users, ShieldCheck } from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const DeviceGroupsView: React.FC = () => {
  const { deviceGroups, devices, createDeviceGroup } = useUEM();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'static' | 'dynamic'>('dynamic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await createDeviceGroup({
      orgId: 'org-apex-01',
      name,
      description,
      type,
      criteria: type === 'dynamic' ? { platform: 'windows' } : undefined,
    });

    setShowModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Static & Dynamic Device Groups</h1>
          <p className="text-xs text-slate-400">
            Rule-based dynamic queries and fixed asset groupings for automated policy deployment
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Device Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deviceGroups.map(grp => (
          <div key={grp.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">{grp.name}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    grp.type === 'dynamic' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                    'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {grp.type}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{grp.description}</p>
              </div>
              <span className="text-base font-bold font-mono text-indigo-400">
                {grp.deviceCount} Endpoints
              </span>
            </div>

            {grp.criteria && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[11px] font-semibold mb-1">Dynamic Membership Criteria:</span>
                <p className="font-mono text-indigo-300 text-[11px]">
                  Platform == "{grp.criteria.platform || 'Any'}" {grp.criteria.minOsVersion ? `&& OS >= ${grp.criteria.minOsVersion}` : ''}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Create Device Group</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Engineering Laptops"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Group Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                >
                  <option value="dynamic">Dynamic Rule-based Query</option>
                  <option value="static">Static Manual Assignment</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 font-semibold text-white"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
