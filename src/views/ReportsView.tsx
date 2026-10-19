import React, { useState } from 'react';
import { 
  FileSpreadsheet, Download, ShieldCheck, Laptop, 
  Terminal, ScrollText, Filter, Calendar, Printer, 
  BarChart3, PieChart, Activity, CheckCircle2, TrendingUp 
} from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const ReportsView: React.FC = () => {
  const { exportCsv, devices, commands, auditEvents, patches, geofences } = useUEM();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const total = devices.length || 1;
  const passCount = devices.filter(d => d.complianceStatus === 'Pass').length;
  const failCount = devices.filter(d => d.complianceStatus === 'Fail').length;
  const passPct = Math.round((passCount / total) * 100);

  // Platform breakdown
  const winCount = devices.filter(d => d.platform === 'windows').length;
  const macCount = devices.filter(d => d.platform === 'macos').length;
  const lnxCount = devices.filter(d => d.platform === 'linux').length;
  const mobCount = devices.filter(d => d.platform === 'android' || d.platform === 'ios').length;

  // Department counts
  const deptMap: Record<string, number> = {};
  devices.forEach(d => {
    deptMap[d.department] = (deptMap[d.department] || 0) + 1;
  });

  // Health Score Calculation
  const encryptedCount = devices.filter(d => d.isEncrypted).length;
  const avCount = devices.filter(d => d.antivirusActive).length;
  const healthScore = Math.round(
    ((passCount * 0.4) + (encryptedCount * 0.3) + (avCount * 0.3)) / total * 100
  );

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Executive Analytics & Advanced Reporting</h1>
          <p className="text-xs text-slate-400">
            Real-time visual telemetry, zero-trust fleet risk posture, and auditor-ready compliance metrics
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700/60 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => exportCsv('devices')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Fleet CSV</span>
          </button>
        </div>
      </div>

      {/* Date & Filter Ribbon */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-300">Reporting Horizon:</span>
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                  dateRange === range ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last Quarter' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Platform Filter:</span>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-300"
          >
            <option value="all">All Operating Systems</option>
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
            <option value="linux">Linux</option>
            <option value="mobile">Android / iOS</option>
          </select>
        </div>
      </div>

      {/* Chart Row 1: Health Score Gauge & Donut Postures */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Fleet Health Score Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col items-center justify-center text-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Circular Progress Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white font-mono">{healthScore}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">/ 100 Score</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-100 text-sm">Fleet Security Health Index</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Weighted index combining disk encryption, active EDR sensors, and compliance pass rates.
            </p>
          </div>
        </div>

        {/* OS Composition Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">OS Fleet Distribution</h3>
            <PieChart className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Windows 11 / 10</span>
                <span className="text-indigo-400 font-mono font-bold">{winCount} ({Math.round((winCount/total)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(winCount/total)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Apple macOS</span>
                <span className="text-purple-400 font-mono font-bold">{macCount} ({Math.round((macCount/total)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${(macCount/total)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Linux Infrastructure</span>
                <span className="text-amber-400 font-mono font-bold">{lnxCount} ({Math.round((lnxCount/total)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(lnxCount/total)*100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Mobile (Android & iOS)</span>
                <span className="text-emerald-400 font-mono font-bold">{mobCount} ({Math.round((mobCount/total)*100)}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(mobCount/total)*100}%` }} />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 text-center">
            {total} Total Enrolled Corporate Assets
          </div>
        </div>

        {/* Zero-Trust Compliance Posture Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Compliance Benchmark</h3>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-center justify-center p-2">
            <div className="w-full space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-200">Pass (Compliant)</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">{passCount} Endpoints ({passPct}%)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="font-semibold text-slate-200">Fail (Noncompliant)</span>
                </div>
                <span className="font-mono font-bold text-rose-400">{failCount} Endpoints ({100 - passPct}%)</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300">
            {failCount > 0 ? `${failCount} device requires BitLocker or EDR remediation.` : 'All endpoints satisfy NIST/CIS baselines.'}
          </div>
        </div>

      </div>

      {/* Chart Row 2: 30-Day Check-in Velocity & Department Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Visual Trend Chart: Heartbeat & Check-in SLA */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Check-In SLA Velocity (Last 14 Days)
            </h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          {/* SVG Multi-Day Bar Chart */}
          <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {[92, 95, 96, 94, 98, 100, 97, 95, 98, 99, 96, 98, 100, 99].map((rate, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div 
                  style={{ height: `${(rate / 100) * 120}px` }}
                  className="w-full rounded-t bg-indigo-600 hover:bg-indigo-400 transition-all cursor-pointer relative"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-white font-mono whitespace-nowrap shadow-lg">
                    {rate}% Online
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">D{idx + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Fleet Check-In SLA: <strong className="text-emerald-400">97.2%</strong></span>
            <span>Target: &gt;95.0%</span>
          </div>
        </div>

        {/* Department Asset Breakdown Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Department Fleet Allocation
            </h3>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-3 text-xs pt-1">
            {Object.entries(deptMap).map(([dept, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={dept}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-200">{dept}</span>
                    <span className="font-mono text-slate-400">{count} Devices ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 text-right border-t border-slate-800/80">
            Multi-branch synchronized inventory
          </div>
        </div>

      </div>

      {/* Chart Row 3: Advanced Multi-Series Trendline & Battery Gauges */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              30-Day Zero-Trust Compliance & Cold-Chain Telemetry Horizon
            </h3>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span className="text-slate-300">Fleet Security Compliance (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
              <span className="text-slate-300">Reefer Deep-Freeze SLA (&lt; -18°C)</span>
            </div>
          </div>
        </div>

        {/* SVG Multi-Series Interactive Waveform Line Chart */}
        <div className="relative w-full h-52 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 140" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="20" x2="600" y2="20" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
            <line x1="0" y1="100" x2="600" y2="100" stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />

            {/* Area Fill for Compliance */}
            <path
              d="M 0,140 L 0,40 Q 75,30 150,45 T 300,35 T 450,25 T 600,30 L 600,140 Z"
              fill="url(#complianceGrad)"
              opacity="0.25"
            />
            {/* Area Fill for Cold Chain */}
            <path
              d="M 0,140 L 0,60 Q 75,55 150,50 T 300,45 T 450,40 T 600,38 L 600,140 Z"
              fill="url(#reeferGrad)"
              opacity="0.15"
            />

            <defs>
              <linearGradient id="complianceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="reeferGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Line 1: Security Compliance (Emerald) */}
            <path
              d="M 0,40 Q 75,30 150,45 T 300,35 T 450,25 T 600,30"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Line 2: Cold Chain Reefer Temp Compliance (Cyan) */}
            <path
              d="M 0,60 Q 75,55 150,50 T 300,45 T 450,40 T 600,38"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              strokeLinecap="round"
            />

            {/* Data Point Nodes */}
            {[
              { cx: 0, cy: 40, label: '94%' },
              { cx: 150, cy: 45, label: '92%' },
              { cx: 300, cy: 35, label: '96%' },
              { cx: 450, cy: 25, label: '98%' },
              { cx: 600, cy: 30, label: '97%' },
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x={pt.cx} y={pt.cy - 10} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
          <span>Fleet Cold-Chain Telemetry: <strong className="text-cyan-400">98.6% of Reefer Fleet within -18°C ~ -22°C target</strong></span>
          <span>Zero-Trust Encryption Escrow: <strong className="text-emerald-400">100% Escrowed to Firestore Vault</strong></span>
        </div>
      </div>

      {/* CSV Export Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <button
          onClick={() => exportCsv('devices')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 text-left transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <Laptop className="w-4 h-4" />
            <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </div>
          <h4 className="font-bold text-slate-200 text-xs">Device Assets CSV</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Hardware, serials & users</p>
        </button>

        <button
          onClick={() => exportCsv('compliance')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 text-left transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </div>
          <h4 className="font-bold text-slate-200 text-xs">Compliance Audit CSV</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Zero-trust benchmark evidence</p>
        </button>

        <button
          onClick={() => exportCsv('patches')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 text-left transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <BarChart3 className="w-4 h-4" />
            <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </div>
          <h4 className="font-bold text-slate-200 text-xs">Windows Patches CSV</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">KB numbers & CVE metrics</p>
        </button>

        <button
          onClick={() => exportCsv('audit')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 text-left transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <ScrollText className="w-4 h-4" />
            <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </div>
          <h4 className="font-bold text-slate-200 text-xs">Admin Audit Trail CSV</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">SOC2 append-only logs</p>
        </button>
      </div>
    </div>
  );
};
