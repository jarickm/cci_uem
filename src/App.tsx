import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { UEMProvider, useUEM } from './context/UEMContext';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { OverviewView } from './views/OverviewView';
import { DevicesView } from './views/DevicesView';
import { EnrollmentView } from './views/EnrollmentView';
import { DeviceGroupsView } from './views/DeviceGroupsView';
import { ApplicationsView } from './views/ApplicationsView';
import { SoftwarePackagesView } from './views/SoftwarePackagesView';
import { PoliciesView } from './views/PoliciesView';
import { PatchManagementView } from './views/PatchManagementView';
import { SecurityComplianceView } from './views/SecurityComplianceView';
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
import { CreatePolicyModal } from './components/common/CreatePolicyModal';
import { Device, CommandAction } from './types/uem';

const UEMAppContent: React.FC = () => {
  const { devices, dispatchCommand } = useUEM();
  const [currentView, setCurrentView] = useState<NavView>('overview');
  
  // Modals state
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [commandTargetDeviceId, setCommandTargetDeviceId] = useState<string | undefined>(undefined);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);
  const commandTargetDevice = devices.find(d => d.id === commandTargetDeviceId);

  const handleOpenCommand = (deviceId?: string) => {
    setCommandTargetDeviceId(deviceId);
    setIsCommandModalOpen(true);
  };

  const handleQuickCommand = async (deviceId: string, action: CommandAction) => {
    await dispatchCommand(deviceId, action);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar onSearchSelect={(devId) => setSelectedDeviceId(devId)} />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
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
                onOpenCommand={(devId) => handleOpenCommand(devId)}
              />
            )}

            {currentView === 'enrollment' && (
              <EnrollmentView onOpenEnrollModal={() => setIsEnrollModalOpen(true)} />
            )}

            {currentView === 'groups' && <DeviceGroupsView />}
            {currentView === 'applications' && <ApplicationsView />}
            {currentView === 'packages' && <SoftwarePackagesView />}
            {currentView === 'policies' && <PoliciesView onOpenCreatePolicy={() => setIsPolicyModalOpen(true)} />}
            {currentView === 'patches' && <PatchManagementView />}
            {currentView === 'compliance' && <SecurityComplianceView />}
            {currentView === 'remote_actions' && <RemoteActionsView onOpenCommandModal={() => handleOpenCommand()} />}
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

      {/* 9-Tab Device Details Modal */}
      {selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          onClose={() => setSelectedDeviceId(null)}
          onDispatchCommand={handleQuickCommand}
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

      {/* Device Enrollment Modal */}
      {isEnrollModalOpen && (
        <EnrollDeviceModal onClose={() => setIsEnrollModalOpen(false)} />
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
    <AuthProvider>
      <UEMProvider>
        <UEMAppContent />
      </UEMProvider>
    </AuthProvider>
  );
}
