import React from 'react';
import { Plug, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const integrations = [
    {
      name: 'Google Workspace & Chrome Enterprise',
      description: 'Synchronize corporate directory users, enforce Chrome browser policies, and OAuth SSO.',
      status: 'Connected',
      icon: 'G',
    },
    {
      name: 'Microsoft Entra ID (Azure AD)',
      description: 'Single Sign-On, Conditional Access policy sync, and enterprise device compliance attestation.',
      status: 'Ready to Configure',
      icon: 'M',
    },
    {
      name: 'CrowdStrike Falcon / SentinelOne EDR',
      description: 'Direct threat ingestion webhook, automated host isolation upon incident detection.',
      status: 'Connected',
      icon: 'C',
    },
    {
      name: 'Splunk / Datadog SIEM Webhooks',
      description: 'Stream immutable audit logs and endpoint heartbeat events to enterprise SIEM.',
      status: 'Connected',
      icon: 'S',
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Enterprise Integrations & Identity Connectors</h1>
          <p className="text-xs text-slate-400">
            Connect corporate identity providers, EDR threat sensors, and SIEM security telemetry pipelines
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(integ => (
          <div key={integ.name} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
                  {integ.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{integ.name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    integ.status === 'Connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {integ.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-400">{integ.description}</p>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                <span>Configure Settings</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
