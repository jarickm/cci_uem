import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const SecurityComplianceView: React.FC = () => {
  const { complianceRules, devices, securityAlerts } = useUEM();

  // Evaluate rule across fleet
  const evaluatedRules = complianceRules.map(rule => {
    let passCount = 0;
    let failCount = 0;

    devices.forEach(d => {
      if (rule.id === 'cmp-01') {
        d.isEncrypted ? passCount++ : failCount++;
      } else if (rule.id === 'cmp-02') {
        d.antivirusActive ? passCount++ : failCount++;
      } else if (rule.id === 'cmp-03') {
        !d.installedApps.some(a => a.isProhibited) ? passCount++ : failCount++;
      } else {
        passCount++;
      }
    });

    return {
      rule,
      passCount,
      failCount,
      compliancePercent: Math.round((passCount / (passCount + failCount || 1)) * 100),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Zero-Trust Security & Compliance Posture</h1>
          <p className="text-xs text-slate-400">
            Automated benchmark validation, CIS / NIST posture evaluation, and remediation action paths
          </p>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evaluatedRules.map(({ rule, passCount, failCount, compliancePercent }) => (
          <div key={rule.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">{rule.name}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    rule.severity === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {rule.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
              </div>
              <span className={`text-base font-bold font-mono ${
                compliancePercent >= 90 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {compliancePercent}%
              </span>
            </div>

            {/* Compliance Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Fleet Coverage</span>
                <span className="font-mono">{passCount} Passing / {failCount} Failing</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-2 rounded-full ${compliancePercent >= 90 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${compliancePercent}%` }} 
                />
              </div>
            </div>

            {/* Criteria & Remediation */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
              <p><strong className="text-slate-300">Evaluation Logic:</strong> <code className="text-indigo-400 font-mono">{rule.criteria}</code></p>
              <p><strong className="text-slate-300">Remediation:</strong> <span className="text-slate-400">{rule.remediationAdvice}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
