import React, { useState } from 'react';
import { 
  Laptop, Search, Filter, Download, Terminal, 
  Plus, CheckSquare, Square, RefreshCw, Lock, 
  Power, ShieldCheck, AlertCircle, ChevronRight, X
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';
import { Platform, DeviceStatus, ComplianceStatus } from '../types/uem';

interface DevicesViewProps {
  onSelectDevice: (deviceId: string) => void;
  onOpenEnroll: () => void;
  onOpenCommand: (deviceId?: string) => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({ 
  onSelectDevice, 
  onOpenEnroll,
  onOpenCommand 
}) => {
  const { devices, exportCsv, dispatchCommand } = useUEM();
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering
  const filteredDevices = devices.filter(d => {
    const matchesSearch = 
      d.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.assignedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ipAddress.includes(searchTerm);

    const matchesPlatform = platformFilter === 'all' || d.platform === platformFilter;
    const matchesCompliance = complianceFilter === 'all' || d.complianceStatus === complianceFilter;
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

    return matchesSearch && matchesPlatform && matchesCompliance && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDevices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDevices.map(d => d.id));
    }
  };

  const toggleSelectDevice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkSync = async () => {
    for (const id of selectedIds) {
      await dispatchCommand(id, 'sync_inventory');
    }
    setSelectedIds([]);
  };

  const handleBulkLock = async () => {
    for (const id of selectedIds) {
      await dispatchCommand(id, 'lock', undefined, true);
    }
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Device Inventory & Assets</h1>
          <p className="text-xs text-slate-400">
            Comprehensive multi-platform hardware, software, and compliance repository ({filteredDevices.length} matching)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportCsv('devices')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenEnroll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Device</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by hostname, user, IP, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Platforms</option>
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
            <option value="linux">Linux</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
          </select>

          {/* Compliance Filter */}
          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Compliance</option>
            <option value="Pass">Compliant (Pass)</option>
            <option value="Fail">Noncompliant (Fail)</option>
            <option value="Unknown">Unknown</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Noncompliant">Noncompliant</option>
            <option value="Inactive">Inactive</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-indigo-200">
            <span className="font-bold">{selectedIds.length}</span> endpoints selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkSync}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Bulk Sync Inventory</span>
            </button>
            <button
              onClick={handleBulkLock}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bulk Lock</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Devices Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold text-[11px] uppercase border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedIds.length > 0 && selectedIds.length === filteredDevices.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Hostname & Model</th>
                <th className="px-4 py-3">Platform & OS</th>
                <th className="px-4 py-3">Assigned User</th>
                <th className="px-4 py-3">Department & Branch</th>
                <th className="px-4 py-3">Security & Encryption</th>
                <th className="px-4 py-3">Compliance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Check-In</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDevices.map(device => {
                const isSelected = selectedIds.includes(device.id);
                return (
                  <tr
                    key={device.id}
                    onClick={() => onSelectDevice(device.id)}
                    className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => toggleSelectDevice(device.id, e)}>
                      <button className="text-slate-400 hover:text-white">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Hostname */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{device.hostname}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {device.hardware.manufacturer} {device.hardware.model}
                      </span>
                    </td>

                    {/* Platform & OS */}
                    <td className="px-4 py-3">
                      <span className="capitalize text-slate-200 font-medium block">{device.platform}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">{device.osVersion}</span>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <span className="text-slate-200 font-medium block">{device.assignedUser}</span>
                      <span className="text-[10px] text-slate-400">{device.assignedUserEmail}</span>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3">
                      <span className="text-slate-300 block">{device.department}</span>
                      <span className="text-[10px] text-slate-400">{device.branch}</span>
                    </td>

                    {/* Encryption & Security */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          device.isEncrypted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {device.isEncrypted ? 'Encrypted' : 'Unencrypted'}
                        </span>
                        {device.antivirusActive && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                            EDR
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Compliance */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        device.complianceStatus === 'Pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {device.complianceStatus}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        device.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {device.status}
                      </span>
                    </td>

                    {/* Last Check-in */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {new Date(device.lastCheckIn).toLocaleTimeString()}
                    </td>

                    {/* Action Menu */}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenCommand(device.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold border border-slate-700/60"
                        title="Dispatch Command"
                      >
                        Action
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
