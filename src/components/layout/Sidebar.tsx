import React from 'react';
import { 
  LayoutDashboard, Laptop, QrCode, Layers, 
  Layers2, Package, ShieldCheck, RefreshCw, 
  FileCheck2, Terminal, Cpu, FileSpreadsheet, 
  Bell, Users, Building2, ScrollText, Plug, 
  Settings, ChevronRight, ShieldAlert, Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUEM } from '../../context/UEMContext';

export type NavView = 
  | 'overview'
  | 'devices'
  | 'enrollment'
  | 'groups'
  | 'applications'
  | 'packages'
  | 'policies'
  | 'patches'
  | 'compliance'
  | 'remote_actions'
  | 'automation'
  | 'reports'
  | 'alerts'
  | 'users'
  | 'organizations'
  | 'audit'
  | 'integrations'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { activeRole } = useAuth();
  const { securityAlerts, commands } = useUEM();

  const openAlertsCount = securityAlerts.filter(a => a.status === 'Open').length;
  const pendingCommandsCount = commands.filter(c => c.status === 'Pending' || c.status === 'Queued').length;

  const navSections = [
    {
      group: 'Core Management',
      items: [
        { id: 'overview' as NavView, label: 'Overview', icon: LayoutDashboard },
        { id: 'devices' as NavView, label: 'Devices', icon: Laptop },
        { id: 'enrollment' as NavView, label: 'Enrollment', icon: QrCode },
        { id: 'groups' as NavView, label: 'Device Groups', icon: Layers },
      ]
    },
    {
      group: 'Software & Configuration',
      items: [
        { id: 'applications' as NavView, label: 'Applications', icon: Layers2 },
        { id: 'packages' as NavView, label: 'Software Packages', icon: Package },
        { id: 'policies' as NavView, label: 'Policies', icon: FileCheck2 },
        { id: 'patches' as NavView, label: 'Patch Management', icon: RefreshCw },
      ]
    },
    {
      group: 'Security & Operations',
      items: [
        { id: 'compliance' as NavView, label: 'Security & Compliance', icon: ShieldCheck },
        { 
          id: 'remote_actions' as NavView, 
          label: 'Remote Actions', 
          icon: Terminal,
          badge: pendingCommandsCount > 0 ? pendingCommandsCount : undefined,
          badgeColor: 'bg-amber-500'
        },
        { id: 'automation' as NavView, label: 'Automation', icon: Cpu },
        { 
          id: 'alerts' as NavView, 
          label: 'Alerts & Threats', 
          icon: Bell,
          badge: openAlertsCount > 0 ? openAlertsCount : undefined,
          badgeColor: 'bg-rose-500'
        },
        { id: 'reports' as NavView, label: 'Reports', icon: FileSpreadsheet },
      ]
    },
    {
      group: 'Administration',
      items: [
        { id: 'users' as NavView, label: 'Users & Roles', icon: Users },
        { id: 'organizations' as NavView, label: 'Tenants & Branches', icon: Building2 },
        { id: 'audit' as NavView, label: 'Audit Logs', icon: ScrollText },
        { id: 'integrations' as NavView, label: 'Integrations', icon: Plug },
        { id: 'settings' as NavView, label: 'System Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800 bg-slate-950/60">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Monitor className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-100 tracking-tight text-base">VANGUARD</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              UEM
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">Enterprise Management</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map(section => (
          <div key={section.group} className="space-y-1">
            <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {section.group}
            </h3>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Role Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="px-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Current Role</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{activeRole}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
        </div>
      </div>
    </aside>
  );
};
