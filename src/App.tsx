import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UEMProvider, useUEM } from './context/UEMContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { OverviewView } from './views/OverviewView';
import { DevicesView } from './views/DevicesView';
import { EnrollmentView } from './views/EnrollmentView';
import { DeviceGroupsView } from './views/DeviceGroupsView';
import { ApplicationsView } from './views/ApplicationsView';
import { VerifiedSoftwareView } from './views/VerifiedSoftwareView';
import { SoftwarePackagesView } from './views/SoftwarePackagesView';
import { PoliciesView } from './views/PoliciesView';
import { PatchManagementView } from './views/PatchManagementView';
import { SecurityComplianceView } from './views/SecurityComplianceView';
import { GeofencingView } from './views/GeofencingView';
import { RemoteActionsView } from './views/RemoteActionsView';
import { AutomationView } from './views/AutomationView';
import { ReportsView } from './views/ReportsView';
import { AlertsView } from './views/AlertsView';
import { UsersRolesView } from './views/UsersRolesView';
import { OrganizationsView } from './views/OrganizationsView';
import { AuditLogsView } from './views/AuditLogsView';
import { IntegrationsView } from './views/IntegrationsView';
import { SettingsView } from './views/SettingsView';

import { DeviceDetailsModal } from './components/common/DeviceDetailsModal';
import { DispatchCommandModal } from './components/common/DispatchCommandModal';
import { EnrollDeviceModal } from './components/common/EnrollDeviceModal';
import { BulkEnrollmentModal } from './components/common/BulkEnrollmentModal';
import { ClearDatabaseModal } from './components/common/ClearDatabaseModal';
import { CreatePolicyModal } from './components/common/CreatePolicyModal';
import { RemoteTerminalModal } from './components/common/RemoteTerminalModal';
import { RemoteDesktopModal } from './components/common/RemoteDesktopModal';
import { Device, CommandAction } from './types/uem';
import { ShieldAlert, LogOut, ArrowRight, Building2, Lock } from 'lucide-react';

const UEMAppContent: React.FC = () => {
  const { devices, dispatchCommand } = useUEM();
  const { isAuthorized, unauthorizedEmail, logout, designatedAdmins, bypassAuthForDemo } = useAuth();
  const { theme } = useTheme();

  const [currentView, setCurrentView] = useState<NavView>('overview');
  
  // Modals state
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [terminalDeviceId, setTerminalDeviceId] = useState<string | null>(null);
  const [remoteDesktopDeviceId, setRemoteDesktopDeviceId] = useState<string | null>(null);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [commandTargetDeviceId, setCommandTargetDeviceId] = useState<string | undefined>(undefined);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isBulkEnrollModalOpen, setIsBulkEnrollModalOpen] = useState(false);
  const [isClearDbModalOpen, setIsClearDbModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);
  const terminalDevice = devices.find(d => d.id === terminalDeviceId);
  const remoteDesktopDevice = devices.find(d => d.id === remoteDesktopDeviceId);
  const commandTargetDevice = devices.find(d => d.id === commandTargetDeviceId);

  const handleOpenCommand = (deviceId?: string) => {
    setCommandTargetDeviceId(deviceId);
    setIsCommandModalOpen(true);
  };

  const handleQuickCommand = async (deviceId: string, action: CommandAction) => {
    await dispatchCommand(deviceId, action);
  };

  // 1. UNAUTHORIZED ACCOUNT SECURITY BARRIER
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen bg-slate-950 p-6 text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Access Restricted
            </span>
            <h2 className="text-lg font-bold text-slate-100 pt-1">Coolaire Consolidated Inc. (CCI)</h2>
            <p className="text-xs text-rose-300 font-mono break-all">
              {unauthorizedEmail || 'Unauthorized Account'}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            In accordance with corporate endpoint security policies, not every Gmail account is permitted access. Only designated CCI administrators and approved @coolaire.com.ph accounts may sign in.
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2.5">
            <span className="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">
              Designated Enterprise Administrators:
            </span>
            {designatedAdmins.map((admin, idx) => (
              <div key={admin.id} className="flex justify-between items-center text-[11px]">
                <span className="text-slate-200 font-medium">{admin.displayName}</span>
                <span className="font-mono text-indigo-400">{admin.email}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Google Account</span>
            </button>

            <button
              onClick={bypassAuthForDemo}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Demo Root Administrator Override</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN APPLICATION WORKSPACE
  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans antialiased ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar with search, theme switcher and clear db trigger */}
        <Navbar 
          onSearchSelect={(devId) => setSelectedDeviceId(devId)}
          onOpenClearDb={() => setIsClearDbModalOpen(true)}
        />

        {/* View Router */}
        <main className={`flex-1 overflow-y-auto p-6 scrollbar-thin ${
          theme === 'dark' ? 'scrollbar-thumb-slate-800' : 'scrollbar-thumb-slate-300'
        }`}>
          <div className="max-w-7xl mx-auto pb-12">
            {currentView === 'overview' && (
              <OverviewView
                onNavigate={setCurrentView}
                onSelectDevice={setSelectedDeviceId}
                onOpenEnroll={() => setIsEnrollModalOpen(true)}
                onOpenCommand={() => handleOpenCommand()}
              />
            )}

            {currentView === 'devices' && (
              <DevicesView
                onSelectDevice={setSelectedDeviceId}
                onOpenEnroll={() => setIsEnrollModalOpen(true)}
                onOpenBulkEnroll={() => setIsBulkEnrollModalOpen(true)}
                onOpenCommand={(devId) => handleOpenCommand(devId)}
                onOpenTerminal={(devId) => setTerminalDeviceId(devId)}
                onOpenRemoteDesktop={(devId) => setRemoteDesktopDeviceId(devId)}
              />
            )}

            {currentView === 'enrollment' && (
              <EnrollmentView 
                onOpenEnrollModal={() => setIsEnrollModalOpen(true)} 
                onOpenBulkModal={() => setIsBulkEnrollModalOpen(true)}
              />
            )}

            {currentView === 'groups' && <DeviceGroupsView />}
            {currentView === 'verified_software' && <VerifiedSoftwareView />}
            {currentView === 'applications' && <ApplicationsView />}
            {currentView === 'packages' && <SoftwarePackagesView />}
            {currentView === 'policies' && <PoliciesView onOpenCreatePolicy={() => setIsPolicyModalOpen(true)} />}
            {currentView === 'patches' && <PatchManagementView />}
            {currentView === 'compliance' && <SecurityComplianceView />}
            {currentView === 'geofencing' && <GeofencingView />}
            {currentView === 'remote_actions' && (
              <RemoteActionsView 
                onOpenCommandModal={() => handleOpenCommand()} 
                onOpenRemoteDesktop={(devId) => setRemoteDesktopDeviceId(devId)}
              />
            )}
            {currentView === 'automation' && <AutomationView />}
            {currentView === 'reports' && <ReportsView />}
            {currentView === 'alerts' && <AlertsView />}
            {currentView === 'users' && <UsersRolesView />}
            {currentView === 'organizations' && <OrganizationsView />}
            {currentView === 'audit' && <AuditLogsView />}
            {currentView === 'integrations' && <IntegrationsView />}
            {currentView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Interactive Remote Desktop Modal */}
      {remoteDesktopDevice && (
        <RemoteDesktopModal
          device={remoteDesktopDevice}
          onClose={() => setRemoteDesktopDeviceId(null)}
          onDispatchCommand={handleQuickCommand}
        />
      )}

      {/* 9-Tab Device Details Modal */}
      {selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          onClose={() => setSelectedDeviceId(null)}
          onDispatchCommand={handleQuickCommand}
          onOpenRemoteDesktop={(devId) => setRemoteDesktopDeviceId(devId)}
        />
      )}

      {/* Remote Shell Terminal Modal */}
      {terminalDevice && (
        <RemoteTerminalModal
          device={terminalDevice}
          onClose={() => setTerminalDeviceId(null)}
          onOpenRemoteDesktop={(devId) => setRemoteDesktopDeviceId(devId)}
        />
      )}

      {/* Remote Action Dispatch Modal */}
      {isCommandModalOpen && (
        <DispatchCommandModal
          device={commandTargetDevice}
          onClose={() => {
            setIsCommandModalOpen(false);
            setCommandTargetDeviceId(undefined);
          }}
        />
      )}

      {/* Device Individual Enrollment Modal */}
      {isEnrollModalOpen && (
        <EnrollDeviceModal onClose={() => setIsEnrollModalOpen(false)} />
      )}

      {/* Bulk Fleet Enrollment Modal */}
      {isBulkEnrollModalOpen && (
        <BulkEnrollmentModal onClose={() => setIsBulkEnrollModalOpen(false)} />
      )}

      {/* Clear Database Modal */}
      {isClearDbModalOpen && (
        <ClearDatabaseModal onClose={() => setIsClearDbModalOpen(false)} />
      )}

      {/* Policy Builder Modal */}
      {isPolicyModalOpen && (
        <CreatePolicyModal onClose={() => setIsPolicyModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UEMProvider>
          <UEMAppContent />
        </UEMProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
