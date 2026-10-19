import React from 'react';
import { Building2, MapPin, Users, Shield, CheckCircle2 } from 'lucide-react';
import { useUEM } from '../context/UEMContext';

export const OrganizationsView: React.FC = () => {
  const { organization, devices } = useUEM();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Multi-Tenant Organizations & Branches</h1>
          <p className="text-xs text-slate-400">
            Tenant boundaries, departmental business units, and branch locations
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{organization.name}</h2>
              <p className="text-slate-400">Tenant ID: <span className="font-mono text-indigo-300">{organization.id}</span></p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {organization.edition}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm">Business Units & Departments</h3>
            <div className="space-y-2">
              {organization.departments.map(dept => {
                const count = devices.filter(d => d.department === dept).length;
                return (
                  <div key={dept} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="font-medium text-slate-200">{dept}</span>
                    <span className="font-mono text-slate-400">{count} Active Endpoints</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Branches */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm">Branch Offices & Remote Zones</h3>
            <div className="space-y-2">
              {organization.branches.map(branch => {
                const count = devices.filter(d => d.branch === branch).length;
                return (
                  <div key={branch} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="font-medium text-slate-200">{branch}</span>
                    <span className="font-mono text-slate-400">{count} Active Endpoints</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
