import React, { useState } from 'react';
import { X, FileCheck2, Shield } from 'lucide-react';
import { Platform, Policy } from '../../types/uem';
import { useUEM } from '../../context/UEMContext';

interface CreatePolicyModalProps {
  onClose: () => void;
}

export const CreatePolicyModal: React.FC<CreatePolicyModalProps> = ({ onClose }) => {
  const { createPolicy, deviceGroups } = useUEM();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform>('windows');
  const [category, setCategory] = useState<Policy['category']>('password');
  const [priority, setPriority] = useState(10);
  const [enforcementMode, setEnforcementMode] = useState<'enforce' | 'audit_only'>('enforce');
  const [targetGroupIds, setTargetGroupIds] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createPolicy({
      orgId: 'org-apex-01',
      name,
      description,
      platform,
      category,
      version: 1,
      priority,
      enforcementMode,
      status: 'active',
      targetGroupIds,
      settings: {
        enforceAtNextCheckIn: true,
        strictMode: true,
      },
    });

    onClose();
  };

  const toggleGroup = (groupId: string) => {
    setTargetGroupIds(prev => 
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Create Configuration Policy</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Policy Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Mandatory BitLocker & USB Storage Restriction"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Explain security rationale and enforcement behavior..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
                <option value="linux">Linux</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category Profile</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="password">Password & Screen Lock</option>
                <option value="encryption">Volume Encryption</option>
                <option value="firewall">Endpoint Firewall</option>
                <option value="wifi">Corporate 802.1X Wi-Fi</option>
                <option value="restrictions">Application Restrictions</option>
                <option value="updates">OS Servicing / Patch</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Enforcement Mode</label>
              <select
                value={enforcementMode}
                onChange={(e) => setEnforcementMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="enforce">Strict Enforcement</option>
                <option value="audit_only">Audit & Compliance Only</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Precedence Priority (1-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 10)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          {/* Target Device Groups */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Target Device Groups</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-lg bg-slate-950 border border-slate-800">
              {deviceGroups.map(grp => (
                <label key={grp.id} className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={targetGroupIds.includes(grp.id)}
                    onChange={() => toggleGroup(grp.id)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>{grp.name} ({grp.type})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              Save & Publish Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
