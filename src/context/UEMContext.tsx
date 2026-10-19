import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Device, DeviceGroup, Policy, ComplianceRule, ApplicationPackage, 
  DeploymentJob, Command, SecurityAlert, AuditEvent, EnrollmentToken, 
  PatchItem, Organization, CommandAction, Platform 
} from '../types/uem';
import { 
  INITIAL_ORG, INITIAL_DEVICES, INITIAL_DEVICE_GROUPS, INITIAL_POLICIES, 
  INITIAL_COMPLIANCE_RULES, INITIAL_PACKAGES, INITIAL_DEPLOYMENTS, 
  INITIAL_COMMANDS, INITIAL_AUDIT_EVENTS, INITIAL_PATCHES 
} from '../services/seedData';
import { db, handleFirestoreError, OperationType, validateFirestoreConnection } from '../firebase/config';
import { collection, doc, getDocs, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface UEMContextType {
  organization: Organization;
  devices: Device[];
  deviceGroups: DeviceGroup[];
  policies: Policy[];
  complianceRules: ComplianceRule[];
  packages: ApplicationPackage[];
  deployments: DeploymentJob[];
  commands: Command[];
  securityAlerts: SecurityAlert[];
  auditEvents: AuditEvent[];
  enrollmentTokens: EnrollmentToken[];
  patches: PatchItem[];
  isLoading: boolean;
  isOnline: boolean;
  
  // Actions
  dispatchCommand: (deviceId: string, action: CommandAction, parameters?: Record<string, any>, requiresApproval?: boolean) => Promise<string>;
  approveCommand: (commandId: string) => Promise<void>;
  cancelCommand: (commandId: string) => Promise<void>;
  executeCommandNow: (commandId: string) => Promise<void>;
  createDevice: (device: Partial<Device>) => Promise<string>;
  updateDevice: (deviceId: string, updates: Partial<Device>) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  createPolicy: (policy: Omit<Policy, 'id' | 'updatedAt' | 'updatedBy'>) => Promise<string>;
  updatePolicy: (policyId: string, updates: Partial<Policy>) => Promise<void>;
  createDeviceGroup: (group: Omit<DeviceGroup, 'id' | 'createdAt' | 'deviceCount'>) => Promise<string>;
  createPackage: (pkg: Omit<ApplicationPackage, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  createDeployment: (dep: Omit<DeploymentJob, 'id' | 'createdAt' | 'createdBy' | 'succeededCount' | 'failedCount'>) => Promise<string>;
  resolveAlert: (alertId: string) => Promise<void>;
  createEnrollmentToken: (platform: Platform, department: string, branch: string, maxUses?: number) => Promise<EnrollmentToken>;
  revokeEnrollmentToken: (tokenId: string) => Promise<void>;
  exportCsv: (dataType: 'devices' | 'compliance' | 'audit' | 'commands') => void;
  syncAllHeartbeats: () => void;
}

const UEMContext = createContext<UEMContextType | undefined>(undefined);

export const UEMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, orgId } = useAuth();
  const [organization, setOrganization] = useState<Organization>(INITIAL_ORG);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>(INITIAL_DEVICE_GROUPS);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>(INITIAL_COMPLIANCE_RULES);
  const [packages, setPackages] = useState<ApplicationPackage[]>(INITIAL_PACKAGES);
  const [deployments, setDeployments] = useState<DeploymentJob[]>(INITIAL_DEPLOYMENTS);
  const [commands, setCommands] = useState<Command[]>(INITIAL_COMMANDS);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: 'alt-01',
      orgId: 'org-apex-01',
      deviceId: 'dev-win-02',
      deviceHostname: 'APX-W11-FIN02',
      title: 'Prohibited BitTorrent Client Running',
      description: 'Unauthorized peer-to-peer executable detected in %ProgramFiles%. Noncompliant with acceptable use policy.',
      severity: 'Critical',
      status: 'Open',
      detectedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    },
    {
      id: 'alt-02',
      orgId: 'org-apex-01',
      deviceId: 'dev-win-02',
      deviceHostname: 'APX-W11-FIN02',
      title: 'BitLocker Volume Encryption Disabled',
      description: 'System disk C: is unencrypted. Endpoint fails PCI-DSS / ISO 27001 baseline.',
      severity: 'High',
      status: 'Open',
      detectedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    }
  ]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [enrollmentTokens, setEnrollmentTokens] = useState<EnrollmentToken[]>([
    {
      id: 'tok-win-01',
      orgId: 'org-apex-01',
      token: 'APEX-WIN-89240-SEC',
      platform: 'windows',
      department: 'Engineering',
      branch: 'New York HQ',
      deviceGroupId: 'grp-win-prod',
      maxUses: 50,
      usedCount: 3,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdBy: 'jmmontojo2019@gmail.com',
      createdAt: '2026-02-15T10:00:00Z',
    },
    {
      id: 'tok-mac-01',
      orgId: 'org-apex-01',
      token: 'APEX-MAC-11492-DEV',
      platform: 'macos',
      department: 'Engineering',
      branch: 'Singapore Regional',
      deviceGroupId: 'grp-eng-mac',
      maxUses: 20,
      usedCount: 2,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdBy: 'jmmontojo2019@gmail.com',
      createdAt: '2026-02-16T14:00:00Z',
    }
  ]);
  const [patches, setPatches] = useState<PatchItem[]>(INITIAL_PATCHES);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Connection validation
  useEffect(() => {
    validateFirestoreConnection().then(status => setIsOnline(status));
  }, []);

  // Sync / Heartbeat simulation
  const syncAllHeartbeats = () => {
    const now = new Date().toISOString();
    setDevices(prev => prev.map(d => ({
      ...d,
      lastCheckIn: d.status === 'Active' ? now : d.lastCheckIn,
    })));
  };

  // Dispatch Command
  const dispatchCommand = async (
    deviceId: string, 
    action: CommandAction, 
    parameters?: Record<string, any>, 
    requiresApproval = false
  ): Promise<string> => {
    const targetDevice = devices.find(d => d.id === deviceId);
    const commandId = `cmd-${Date.now().toString(36)}`;
    
    // High-impact actions require approval
    const isHighImpact = action === 'wipe' || action === 'run_script' || action === 'lock';
    const approvalNeeded = requiresApproval || isHighImpact;

    const newCommand: Command = {
      id: commandId,
      orgId,
      deviceId,
      deviceHostname: targetDevice?.hostname || deviceId,
      action,
      parameters,
      requestedBy: userProfile.email,
      status: approvalNeeded ? 'Pending' : 'Queued',
      approvalRequired: approvalNeeded,
      createdAt: new Date().toISOString(),
    };

    setCommands(prev => [newCommand, ...prev]);

    // Record audit event
    recordAudit('COMMAND_DISPATCH', `Dispatched ${action} command to device ${targetDevice?.hostname || deviceId}`, 'commands', commandId);

    // If auto-queued, simulate endpoint execution within 3 seconds
    if (!approvalNeeded) {
      setTimeout(() => {
        executeCommandNow(commandId);
      }, 2500);
    }

    return commandId;
  };

  const approveCommand = async (commandId: string) => {
    setCommands(prev => prev.map(c => {
      if (c.id === commandId) {
        return {
          ...c,
          status: 'Queued',
          approvedBy: userProfile.email,
        };
      }
      return c;
    }));

    recordAudit('COMMAND_APPROVED', `Approved command ${commandId}`, 'commands', commandId);

    setTimeout(() => {
      executeCommandNow(commandId);
    }, 2000);
  };

  const cancelCommand = async (commandId: string) => {
    setCommands(prev => prev.map(c => {
      if (c.id === commandId) {
        return { ...c, status: 'Cancelled' };
      }
      return c;
    }));
    recordAudit('COMMAND_CANCELLED', `Cancelled command ${commandId}`, 'commands', commandId);
  };

  const executeCommandNow = async (commandId: string) => {
    setCommands(prev => prev.map(c => {
      if (c.id === commandId) {
        return { ...c, status: 'Running' };
      }
      return c;
    }));

    setTimeout(() => {
      setCommands(prev => prev.map(c => {
        if (c.id === commandId) {
          let resultMsg = 'Command executed successfully by endpoint agent.';
          if (c.action === 'sync_inventory') {
            resultMsg = 'Hardware, OS, network and software inventory refreshed cleanly.';
          } else if (c.action === 'restart') {
            resultMsg = 'Endpoint initiated controlled OS restart.';
          } else if (c.action === 'lock') {
            resultMsg = 'Endpoint screen locked and remote admin session locked.';
          } else if (c.action === 'wipe') {
            resultMsg = 'Cryptographic BitLocker volume wipe initiated; device reset to factory state.';
          } else if (c.action === 'diagnostic_bundle') {
            resultMsg = 'Diagnostic bundle (systeminfo, eventvwr, network) bundled into 3.8MB archive.';
          }

          return {
            ...c,
            status: 'Succeeded',
            result: resultMsg,
            executionLog: `[${new Date().toISOString()}] Agent authenticated handshake; payload executed with exit code 0.`,
            completedAt: new Date().toISOString(),
          };
        }
        return c;
      }));

      // Update target device state if applicable
      const targetCmd = commands.find(c => c.id === commandId);
      if (targetCmd) {
        if (targetCmd.action === 'sync_inventory') {
          setDevices(prev => prev.map(d => d.id === targetCmd.deviceId ? { ...d, lastCheckIn: new Date().toISOString() } : d));
        } else if (targetCmd.action === 'wipe') {
          setDevices(prev => prev.map(d => d.id === targetCmd.deviceId ? { ...d, status: 'Retired', complianceStatus: 'NotApplicable' } : d));
        }
      }
    }, 2000);
  };

  const createDevice = async (deviceData: Partial<Device>): Promise<string> => {
    const id = deviceData.id || `dev-${Date.now().toString(36)}`;
    const fullDevice: Device = {
      id,
      orgId,
      hostname: deviceData.hostname || 'NEW-ENDPOINT',
      platform: deviceData.platform || 'windows',
      osVersion: deviceData.osVersion || 'Windows 11 Enterprise',
      osBuild: deviceData.osBuild || '22631.3000',
      architecture: 'x64',
      serialNumber: deviceData.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Active',
      complianceStatus: 'Pass',
      assignedUser: deviceData.assignedUser || 'Staff Member',
      assignedUserEmail: deviceData.assignedUserEmail || 'user@apex-global.com',
      department: deviceData.department || 'Engineering',
      branch: deviceData.branch || 'New York HQ',
      ipAddress: deviceData.ipAddress || '10.240.50.81',
      macAddress: deviceData.macAddress || 'A0:B1:C2:D3:E4:F5',
      agentVersion: 'v2.6.4-prod',
      lastCheckIn: new Date().toISOString(),
      enrolledAt: new Date().toISOString(),
      isEncrypted: true,
      firewallEnabled: true,
      antivirusActive: true,
      hardware: deviceData.hardware || {
        cpu: 'Intel Core i7-13800H',
        cores: 14,
        memoryGb: 32,
        storageTotalGb: 512,
        storageAvailableGb: 340,
        macAddress: 'A0:B1:C2:D3:E4:F5',
        ipAddress: '10.240.50.81',
        manufacturer: 'Dell Inc.',
        model: 'Latitude 7440',
      },
      installedApps: deviceData.installedApps || [
        { id: 'app-01', name: 'Google Chrome Enterprise', publisher: 'Google LLC', version: '130.0', isApproved: true },
        { id: 'app-02', name: 'CrowdStrike Falcon Sensor', publisher: 'CrowdStrike Inc.', version: '7.18', isApproved: true },
      ],
      appliedPolicyIds: ['pol-sec-01'],
      ...deviceData,
    };

    setDevices(prev => [fullDevice, ...prev]);
    recordAudit('DEVICE_ENROLL', `Device ${fullDevice.hostname} enrolled into fleet`, 'devices', id);
    return id;
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, ...updates } : d));
    recordAudit('DEVICE_UPDATE', `Updated configuration for device ${deviceId}`, 'devices', deviceId);
  };

  const deleteDevice = async (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    recordAudit('DEVICE_DECOMMISSION', `Decommissioned and deleted device ${deviceId}`, 'devices', deviceId);
  };

  const createPolicy = async (policyData: Omit<Policy, 'id' | 'updatedAt' | 'updatedBy'>): Promise<string> => {
    const id = `pol-${Date.now().toString(36)}`;
    const newPolicy: Policy = {
      ...policyData,
      id,
      updatedAt: new Date().toISOString(),
      updatedBy: userProfile.email,
    };
    setPolicies(prev => [newPolicy, ...prev]);
    recordAudit('POLICY_CREATE', `Created policy ${newPolicy.name}`, 'policies', id);
    return id;
  };

  const updatePolicy = async (policyId: string, updates: Partial<Policy>) => {
    setPolicies(prev => prev.map(p => p.id === policyId ? { 
      ...p, 
      ...updates, 
      updatedAt: new Date().toISOString(), 
      updatedBy: userProfile.email 
    } : p));
    recordAudit('POLICY_UPDATE', `Updated policy ${policyId}`, 'policies', policyId);
  };

  const createDeviceGroup = async (groupData: Omit<DeviceGroup, 'id' | 'createdAt' | 'deviceCount'>): Promise<string> => {
    const id = `grp-${Date.now().toString(36)}`;
    const newGroup: DeviceGroup = {
      ...groupData,
      id,
      createdAt: new Date().toISOString(),
      deviceCount: groupData.deviceIds?.length || 0,
    };
    setDeviceGroups(prev => [...prev, newGroup]);
    recordAudit('GROUP_CREATE', `Created device group ${newGroup.name}`, 'deviceGroups', id);
    return id;
  };

  const createPackage = async (pkgData: Omit<ApplicationPackage, 'id' | 'createdAt' | 'createdBy'>): Promise<string> => {
    const id = `pkg-${Date.now().toString(36)}`;
    const newPackage: ApplicationPackage = {
      ...pkgData,
      id,
      createdAt: new Date().toISOString(),
      createdBy: userProfile.email,
    };
    setPackages(prev => [newPackage, ...prev]);
    recordAudit('PACKAGE_UPLOAD', `Uploaded software package ${newPackage.name} (${newPackage.version})`, 'applications', id);
    return id;
  };

  const createDeployment = async (depData: Omit<DeploymentJob, 'id' | 'createdAt' | 'createdBy' | 'succeededCount' | 'failedCount'>): Promise<string> => {
    const id = `dep-${Date.now().toString(36)}`;
    const newDeployment: DeploymentJob = {
      ...depData,
      id,
      succeededCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: userProfile.email,
    };
    setDeployments(prev => [newDeployment, ...prev]);
    recordAudit('DEPLOYMENT_SCHEDULE', `Scheduled deployment ring ${newDeployment.ring} for package ${newDeployment.packageName}`, 'deployments', id);
    return id;
  };

  const resolveAlert = async (alertId: string) => {
    setSecurityAlerts(prev => prev.map(a => a.id === alertId ? {
      ...a,
      status: 'Resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: userProfile.email,
    } : a));
    recordAudit('ALERT_RESOLVED', `Resolved security alert ${alertId}`, 'securityAlerts', alertId);
  };

  const createEnrollmentToken = async (
    platform: Platform, 
    department: string, 
    branch: string, 
    maxUses = 25
  ): Promise<EnrollmentToken> => {
    const id = `tok-${Date.now().toString(36)}`;
    const tokenString = `APEX-${platform.toUpperCase().substring(0,3)}-${Math.floor(10000 + Math.random() * 90000)}-EXP`;
    const newToken: EnrollmentToken = {
      id,
      orgId,
      token: tokenString,
      platform,
      department,
      branch,
      maxUses,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdBy: userProfile.email,
      createdAt: new Date().toISOString(),
    };
    setEnrollmentTokens(prev => [newToken, ...prev]);
    recordAudit('ENROLLMENT_TOKEN_CREATE', `Generated enrollment token for ${platform} (${department})`, 'enrollmentTokens', id);
    return newToken;
  };

  const revokeEnrollmentToken = async (tokenId: string) => {
    setEnrollmentTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'revoked' } : t));
    recordAudit('ENROLLMENT_TOKEN_REVOKE', `Revoked enrollment token ${tokenId}`, 'enrollmentTokens', tokenId);
  };

  const recordAudit = (action: string, details: string, targetResource: string, targetId: string) => {
    const eventId = `aud-${Date.now().toString(36)}`;
    const newEvent: AuditEvent = {
      id: eventId,
      orgId,
      actorEmail: userProfile.email,
      action,
      targetResource,
      targetId,
      outcome: 'Success',
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditEvents(prev => [newEvent, ...prev]);
  };

  const exportCsv = (dataType: 'devices' | 'compliance' | 'audit' | 'commands') => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (dataType === 'devices') {
      headers = ['ID', 'Hostname', 'Platform', 'OS Version', 'Status', 'Compliance', 'User', 'Department', 'IP Address', 'Last Check-In'];
      rows = devices.map(d => [
        d.id, d.hostname, d.platform, d.osVersion, d.status, d.complianceStatus, d.assignedUser, d.department, d.ipAddress, d.lastCheckIn
      ]);
    } else if (dataType === 'audit') {
      headers = ['Event ID', 'Timestamp', 'Actor', 'Action', 'Target Resource', 'Target ID', 'Outcome', 'Details'];
      rows = auditEvents.map(a => [
        a.id, a.timestamp, a.actorEmail, a.action, a.targetResource, a.targetId, a.outcome, a.details || ''
      ]);
    } else if (dataType === 'commands') {
      headers = ['Command ID', 'Device', 'Action', 'Requested By', 'Status', 'Created At', 'Completed At', 'Result'];
      rows = commands.map(c => [
        c.id, c.deviceHostname, c.action, c.requestedBy, c.status, c.createdAt, c.completedAt || '', c.result || ''
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vanguard_uem_${dataType}_export_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <UEMContext.Provider
      value={{
        organization,
        devices,
        deviceGroups,
        policies,
        complianceRules,
        packages,
        deployments,
        commands,
        securityAlerts,
        auditEvents,
        enrollmentTokens,
        patches,
        isLoading,
        isOnline,
        dispatchCommand,
        approveCommand,
        cancelCommand,
        executeCommandNow,
        createDevice,
        updateDevice,
        deleteDevice,
        createPolicy,
        updatePolicy,
        createDeviceGroup,
        createPackage,
        createDeployment,
        resolveAlert,
        createEnrollmentToken,
        revokeEnrollmentToken,
        exportCsv,
        syncAllHeartbeats,
      }}
    >
      {children}
    </UEMContext.Provider>
  );
};

export const useUEM = () => {
  const context = useContext(UEMContext);
  if (!context) {
    throw new Error('useUEM must be used within a UEMProvider');
  }
  return context;
};
