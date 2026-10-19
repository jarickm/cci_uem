import React, { useState } from 'react';
import { 
  FileCheck2, Plus, ShieldCheck, Laptop, 
  Settings2, AlertCircle, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { Policy } from '../types/uem';

interface PoliciesViewProps {
  onOpenCreatePolicy: () => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({ onOpenCreatePolicy }) => {
  const { policies, deviceGroups, devices } = useUEM();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPolicies = policies.filter(p => 
    selectedCategory === 'all' || p.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Policies & Configuration Baselines</h1>
          <p className="text-xs text-slate-400">
            Version-controlled configuration profiles, volume encryption standards, and endpoint compliance gates
          </p>
        </div>

        <button
          onClick={onOpenCreatePolicy}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Policy</span>
        </button>
      </div>

      {/* State Explanation Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-300"><strong className="text-slate-100">Desired State:</strong> Admin policy specification</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-300"><strong className="text-slate-100">Reported State:</strong> Endpoint telemetry report</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300"><strong className="text-slate-100">Effective State:</strong> Resolved precedence</span>
          </div>
        </div>
      </div>

      {/* Policy Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'password', 'encryption', 'firewall', 'wifi', 'restrictions'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white font-semibold' 
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All Profiles' : cat}
          </button>
        ))}
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPolicies.map(policy => {
          const targetedGroups = deviceGroups.filter(g => policy.targetGroupIds.includes(g.id));
          return (
            <div 
              key={policy.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">{policy.name}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {policy.platform}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{policy.description}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {policy.status.toUpperCase()}
                </span>
              </div>

              {/* Policy Properties */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Category</span>
                  <span className="font-semibold text-slate-200 capitalize">{policy.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Version</span>
                  <span className="font-semibold text-indigo-400">v{policy.version}.0</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Priority</span>
                  <span className="font-semibold text-amber-400">Level {policy.priority}</span>
                </div>
              </div>

              {/* Enforcement & Targets */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span>Targeted to:</span>
                  <span className="font-semibold text-slate-200">
                    {targetedGroups.length > 0 ? targetedGroups.map(g => g.name).join(', ') : 'All Enrolled Fleet'}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {policy.enforcementMode === 'enforce' ? 'Enforced' : 'Audit Only'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
