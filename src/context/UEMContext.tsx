import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Device, DeviceGroup, Policy, ComplianceRule, ApplicationPackage, 
  DeploymentJob, Command, SecurityAlert, AuditEvent, EnrollmentToken, 
  PatchItem, Organization, CommandAction, Platform, Geofence, VerifiedSoftware, DeviceLocation, BulkEnrollmentItem 
} from '../types/uem';
import { 
  INITIAL_ORG, INITIAL_DEVICES, INITIAL_DEVICE_GROUPS, INITIAL_POLICIES, 
  INITIAL_COMPLIANCE_RULES, INITIAL_PACKAGES, INITIAL_DEPLOYMENTS, 
  INITIAL_COMMANDS, INITIAL_AUDIT_EVENTS, INITIAL_PATCHES, 
  INITIAL_GEOFENCES, INITIAL_VERIFIED_SOFTWARE 
} from '../services/seedData';
import { db, handleFirestoreError, OperationType, validateFirestoreConnection } from '../firebase/config';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

// Haversine formula to compute distance in meters between two lat/lng coordinates
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

interface UEMContextType {
  organization: Organization;
  devices: Device[];
  deviceGroups: DeviceGroup[];
  policies: Policy[];
  complianceRules: ComplianceRule[];
  packages: ApplicationPackage[];
  verifiedSoftware: VerifiedSoftware[];
  geofences: Geofence[];
  deployments: DeploymentJob[];
  commands: Command[];
  securityAlerts: SecurityAlert[];
  auditEvents: AuditEvent[];
  enrollmentTokens: EnrollmentToken[];
  patches: PatchItem[];
  isLoading: boolean;
  isOnline: boolean;
  isFirestoreSynced: boolean;
  firestoreDocCounts: Record<string, number>;
  
  // Actions
  dispatchCommand: (deviceId: string, action: CommandAction, parameters?: Record<string, any>, requiresApproval?: boolean) => Promise<string>;
  approveCommand: (commandId: string) => Promise<void>;
  cancelCommand: (commandId: string) => Promise<void>;
  executeCommandNow: (commandId: string) => Promise<void>;
  executeRemoteTerminal: (deviceId: string, commandStr: string) => Promise<{ stdout: string; stderr?: string; exitCode: number }>;
  
  // Device & Groups
  createDevice: (device: Partial<Device>) => Promise<string>;
  updateDevice: (deviceId: string, updates: Partial<Device>) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  updateDeviceLocation: (deviceId: string, lat: number, lng: number) => Promise<void>;
  
  // Policies & Software
  createPolicy: (policy: Omit<Policy, 'id' | 'updatedAt' | 'updatedBy'>) => Promise<string>;
  updatePolicy: (policyId: string, updates: Partial<Policy>) => Promise<void>;
  createDeviceGroup: (group: Omit<DeviceGroup, 'id' | 'createdAt' | 'deviceCount'>) => Promise<string>;
  createPackage: (pkg: Omit<ApplicationPackage, 'id' | 'createdAt' | 'createdBy'>) => Promise<string>;
  deployVerifiedSoftware: (softwareId: string, targetGroupId: string, ring?: DeploymentJob['ring']) => Promise<string>;
  createDeployment: (dep: Omit<DeploymentJob, 'id' | 'createdAt' | 'createdBy' | 'succeededCount' | 'failedCount'>) => Promise<string>;
  
  // Windows Patches
  triggerWindowsUpdateScan: (deviceId?: string) => Promise<void>;
  approvePatch: (patchId: string) => Promise<void>;
  installPatchOnFleet: (patchId: string) => Promise<void>;

  // Geofencing
  createGeofence: (geo: Omit<Geofence, 'id' | 'createdAt'>) => Promise<string>;
  updateGeofence: (geofenceId: string, updates: Partial<Geofence>) => Promise<void>;
  deleteGeofence: (geofenceId: string) => Promise<void>;

  // Alerts & Tokens
  resolveAlert: (alertId: string) => Promise<void>;
  createEnrollmentToken: (platform: Platform, department: string, branch: string, maxUses?: number) => Promise<EnrollmentToken>;
  revokeEnrollmentToken: (tokenId: string) => Promise<void>;
  
  // Bulk Enrollment & Database Reset
  bulkEnrollDevices: (items: BulkEnrollmentItem[]) => Promise<number>;
  clearDatabase: (mode: 'wipe_all' | 'reset_seed' | 'clear_queue') => Promise<void>;

  // Utilities & Export
  exportCsv: (dataType: 'devices' | 'compliance' | 'audit' | 'commands' | 'patches' | 'geofences') => void;
  syncAllHeartbeats: () => void;
  syncToFirestoreNow: () => Promise<void>;
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
  const [verifiedSoftware, setVerifiedSoftware] = useState<VerifiedSoftware[]>(INITIAL_VERIFIED_SOFTWARE);
  const [geofences, setGeofences] = useState<Geofence[]>(INITIAL_GEOFENCES);
  const [deployments, setDeployments] = useState<DeploymentJob[]>(INITIAL_DEPLOYMENTS);
  const [commands, setCommands] = useState<Command[]>(INITIAL_COMMANDS);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: 'alt-01',
      orgId: 'org-apex-01',
      deviceId: 'dev-win-02',
      deviceHostname: 'APX-W11-FIN02',
      title: 'Geofence Boundary Breach Detected',
      description: 'Device APX-W11-FIN02 moved outside London Technology Innovation Center radius (550m from center).',
      severity: 'Critical',
      status: 'Open',
      detectedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 'alt-02',
      orgId: 'org-apex-01',
      deviceId: 'dev-win-02',
      deviceHostname: 'APX-W11-FIN02',
      title: 'Prohibited BitTorrent Client Running',
      description: 'Unauthorized peer-to-peer executable detected in %ProgramFiles%. Noncompliant with acceptable use policy.',
      severity: 'High',
      status: 'Open',
      detectedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
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
  const [isFirestoreSynced, setIsFirestoreSynced] = useState(false);
  const [firestoreDocCounts, setFirestoreDocCounts] = useState<Record<string, number>>({});

  // 1. Initial Firestore Synchronization
  useEffect(() => {
    let isMounted = true;
    async function initFirestore() {
      try {
        const isConnected = await validateFirestoreConnection();
        if (!isMounted) return;
        setIsOnline(isConnected);

        // Fetch existing devices from Firestore
        const devicesSnap = await getDocs(collection(db, 'devices'));
        if (devicesSnap.empty) {
          console.log('[Firestore] Empty collection detected. Seeding enterprise records...');
          // Seed devices into Firestore
          for (const d of INITIAL_DEVICES) {
            await setDoc(doc(db, 'devices', d.id), d);
          }
          for (const g of INITIAL_GEOFENCES) {
            await setDoc(doc(db, 'geofences', g.id), g);
          }
          for (const p of INITIAL_POLICIES) {
            await setDoc(doc(db, 'policies', p.id), p);
          }
          for (const c of INITIAL_COMMANDS) {
            await setDoc(doc(db, 'commands', c.id), c);
          }
          setFirestoreDocCounts({
            devices: INITIAL_DEVICES.length,
            geofences: INITIAL_GEOFENCES.length,
            policies: INITIAL_POLICIES.length,
            commands: INITIAL_COMMANDS.length,
          });
        } else {
          const loadedDevices: Device[] = [];
          devicesSnap.forEach(d => loadedDevices.push(d.data() as Device));
          if (loadedDevices.length > 0) {
            setDevices(loadedDevices);
          }
          setFirestoreDocCounts(prev => ({ ...prev, devices: devicesSnap.size }));
        }

        // Set real-time listener on devices collection
        onSnapshot(collection(db, 'devices'), (snapshot) => {
          if (!snapshot.empty) {
            const updated: Device[] = [];
            snapshot.forEach(docSnap => updated.push(docSnap.data() as Device));
            setDevices(updated);
            setFirestoreDocCounts(prev => ({ ...prev, devices: snapshot.size }));
          }
        }, (err) => {
          console.warn('Realtime listener fallback to local state:', err);
        });

        setIsFirestoreSynced(true);
      } catch (err) {
        console.warn('Firestore initial sync error, operating with robust local layer:', err);
        setIsFirestoreSynced(true);
      }
    }

    initFirestore();
    return () => { isMounted = false; };
  }, []);

  // Sync to Firestore manually
  const syncToFirestoreNow = async () => {
    setIsLoading(true);
    try {
      for (const d of devices) {
        await setDoc(doc(db, 'devices', d.id), d);
      }
      for (const g of geofences) {
        await setDoc(doc(db, 'geofences', g.id), g);
      }
      for (const c of commands) {
        await setDoc(doc(db, 'commands', c.id), c);
      }
      setIsFirestoreSynced(true);
      setFirestoreDocCounts({
        devices: devices.length,
        geofences: geofences.length,
        commands: commands.length,
        policies: policies.length,
      });
      recordAudit('FIRESTORE_SYNC', 'Synchronized in-memory telemetry to Cloud Firestore', 'system', 'firestore');
    } catch (err) {
      console.error('Manual Firestore sync error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-evaluate device geofence status
  const evaluateDeviceLocation = (lat: number, lng: number): { inside: boolean; fenceName?: string } => {
    for (const fence of geofences.filter(f => f.enabled)) {
      const distance = calculateDistanceMeters(lat, lng, fence.latitude, fence.longitude);
      if (distance <= fence.radiusMeters) {
        return { inside: true, fenceName: fence.name };
      }
    }
    return { inside: false };
  };

  const updateDeviceLocation = async (deviceId: string, lat: number, lng: number) => {
    const geoResult = evaluateDeviceLocation(lat, lng);
    const updatedLocation: DeviceLocation = {
      latitude: lat,
      longitude: lng,
      accuracyMeters: 8,
      insideGeofence: geoResult.inside,
      activeGeofenceName: geoResult.fenceName,
      lastUpdated: new Date().toISOString(),
    };

    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          location: updatedLocation,
          complianceStatus: !geoResult.inside ? 'Fail' : d.complianceStatus,
        };
      }
      return d;
    }));

    // If device is outside, create critical security alert
    if (!geoResult.inside) {
      const targetDev = devices.find(d => d.id === deviceId);
      const newAlert: SecurityAlert = {
        id: `alt-geo-${Date.now().toString(36)}`,
        orgId,
        deviceId,
        deviceHostname: targetDev?.hostname || deviceId,
        title: 'Geofence Boundary Violation',
        description: `Device ${targetDev?.hostname} physically breached designated geofence perimeters. Current coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}].`,
        severity: 'Critical',
        status: 'Open',
        detectedAt: new Date().toISOString(),
      };
      setSecurityAlerts(prev => [newAlert, ...prev]);
      recordAudit('GEOFENCE_BREACH', `Device ${targetDev?.hostname} breached geofence boundary`, 'devices', deviceId);
    }

    try {
      await updateDoc(doc(db, 'devices', deviceId), { location: updatedLocation });
    } catch (err) {
      // Local fallback
    }
  };

  // Heartbeat simulation
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
    
    const isHighImpact = action === 'wipe' || action === 'lock' || action === 'shutdown' || action === 'terminal_exec';
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
    recordAudit('COMMAND_DISPATCH', `Dispatched ${action} command to ${targetDevice?.hostname || deviceId}`, 'commands', commandId);

    try {
      await setDoc(doc(db, 'commands', commandId), newCommand);
    } catch (e) {
      // Local state fallback
    }

    if (!approvalNeeded) {
      setTimeout(() => {
        executeCommandNow(commandId);
      }, 2000);
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
    }, 1800);
  };

  const cancelCommand = async (commandId: string) => {
    setCommands(prev => prev.map(c => c.id === commandId ? { ...c, status: 'Cancelled' } : c));
    recordAudit('COMMAND_CANCELLED', `Cancelled command ${commandId}`, 'commands', commandId);
  };

  const executeCommandNow = async (commandId: string) => {
    setCommands(prev => prev.map(c => c.id === commandId ? { ...c, status: 'Running' } : c));

    setTimeout(() => {
      setCommands(prev => prev.map(c => {
        if (c.id === commandId) {
          let resultMsg = 'Command executed successfully by endpoint agent.';
          if (c.action === 'sync_inventory') {
            resultMsg = 'Hardware, OS, network and software inventory refreshed cleanly.';
          } else if (c.action === 'restart') {
            resultMsg = 'Endpoint initiated controlled OS restart via shutdown.exe /r /t 0.';
          } else if (c.action === 'lock') {
            resultMsg = 'Endpoint screen locked and remote user session suspended.';
          } else if (c.action === 'wipe') {
            resultMsg = 'Cryptographic BitLocker volume wipe completed. System reset to factory state.';
          } else if (c.action === 'diagnostic_bundle') {
            resultMsg = 'Diagnostic bundle (systeminfo, eventvwr, network) bundled into 3.8MB archive.';
          } else if (c.action === 'windows_update_scan') {
            resultMsg = 'USOClient scan finished. 2 applicable cumulative updates staged for installation.';
          } else if (c.action === 'windows_update_install') {
            resultMsg = 'Applied Microsoft Windows Update package. Exit Code 0 (Success).';
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

  // Interactive Remote Terminal
  const executeRemoteTerminal = async (
    deviceId: string, 
    commandStr: string
  ): Promise<{ stdout: string; stderr?: string; exitCode: number }> => {
    const targetDev = devices.find(d => d.id === deviceId);
    const cmdTrimmed = commandStr.trim().toLowerCase();

    // Log audit
    recordAudit('REMOTE_TERMINAL_EXEC', `Executed shell command on ${targetDev?.hostname}: "${commandStr}"`, 'devices', deviceId);

    // Realistic outputs based on command entered
    if (cmdTrimmed.includes('get-process') || cmdTrimmed === 'ps' || cmdTrimmed === 'ps aux') {
      return {
        exitCode: 0,
        stdout: `Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id ProcessName
-------  ------    -----      -----     ------     -- -----------
    412      24    42100      58200      12.42   1044 explorer
    890      48   148200     192400      48.19   2180 chrome
    610      32    98100     124000      22.04   3412 VanguardAgent
    320      18    38200      49100       8.11   4108 CSFpsrv (CrowdStrike)
    190      12    14500      21000       2.05    884 svchost`,
      };
    } else if (cmdTrimmed.includes('ipconfig') || cmdTrimmed === 'ifconfig' || cmdTrimmed === 'ip a') {
      return {
        exitCode: 0,
        stdout: `Windows IP Configuration

Ethernet adapter vEthernet (Corporate-Primary):
   Connection-specific DNS Suffix  . : apex-global.corp
   IPv4 Address. . . . . . . . . . . : ${targetDev?.ipAddress || '10.240.12.45'}
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.240.12.1
   Physical Address. . . . . . . . . : ${targetDev?.macAddress || '00-1A-2B-3C-4D-5E'}`,
      };
    } else if (cmdTrimmed.includes('manage-bde') || cmdTrimmed.includes('bitlocker')) {
      return {
        exitCode: 0,
        stdout: `BitLocker Drive Encryption: Configuration Tool version 10.0.22621
Volume C: [OSDisk]
[OS Volume]
    Conversion Status:    Fully Encrypted
    Percentage Encrypted: 100.0%
    Encryption Method:    XTS-AES 256
    Protection Status:    Protection On
    Lock Status:          Unlocked
    Identification Field: APEX-CORP-KEY-01
    Key Protectors:
        TPM 2.0
        Numerical Password (Escrowed to Vanguard UEM Vault)`,
      };
    } else if (cmdTrimmed.includes('systeminfo') || cmdTrimmed.includes('uname')) {
      return {
        exitCode: 0,
        stdout: `Host Name:                 ${targetDev?.hostname || 'APX-W11-ENG04'}
OS Name:                   ${targetDev?.osVersion || 'Microsoft Windows 11 Enterprise'}
OS Version:                10.0.22631 N/A Build 22631
System Manufacturer:       ${targetDev?.hardware.manufacturer || 'Dell Inc.'}
System Model:              ${targetDev?.hardware.model || 'Latitude 7440'}
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed: [01]: ${targetDev?.hardware.cpu || 'Intel64 Family'}
Total Physical Memory:     ${targetDev?.hardware.memoryGb || 32} GB
BIOS Version:              ${targetDev?.hardware.biosVersion || 'Dell UEFI 1.14.0'}`,
      };
    } else {
      return {
        exitCode: 0,
        stdout: `[Vanguard Agent Remote Execution Success]\nExecuted: ${commandStr}\nTimestamp: ${new Date().toISOString()}\nTarget: ${targetDev?.hostname} (${targetDev?.platform})\nOutput: Operation completed with status code 0.`,
      };
    }
  };

  // Device Creation & Deletion
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
      location: deviceData.location || {
        latitude: 40.7061,
        longitude: -74.0087,
        accuracyMeters: 5,
        address: 'New York HQ Campus',
        insideGeofence: true,
        activeGeofenceName: 'New York Global HQ Campus',
        lastUpdated: new Date().toISOString(),
      },
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

    try {
      await setDoc(doc(db, 'devices', id), fullDevice);
    } catch (e) {
      // Local fallback
    }

    return id;
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, ...updates } : d));
    recordAudit('DEVICE_UPDATE', `Updated configuration for device ${deviceId}`, 'devices', deviceId);
    try {
      await updateDoc(doc(db, 'devices', deviceId), updates);
    } catch (e) {
      // Local fallback
    }
  };

  const deleteDevice = async (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    recordAudit('DEVICE_DECOMMISSION', `Decommissioned and deleted device ${deviceId}`, 'devices', deviceId);
    try {
      await deleteDoc(doc(db, 'devices', deviceId));
    } catch (e) {
      // Local fallback
    }
  };

  // Bulk Enrollment Implementation
  const bulkEnrollDevices = async (items: BulkEnrollmentItem[]): Promise<number> => {
    let successCount = 0;
    const newDevices: Device[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const id = `dev-${item.platform.substring(0, 3)}-${Date.now().toString(36)}-${i + 1}`;
      
      const isAndroid = item.platform === 'android';
      const isMac = item.platform === 'macos';

      const model = item.model || (isAndroid ? 'Samsung Galaxy Tab Active4 Pro' : isMac ? 'Apple MacBook Pro M3' : 'Dell Latitude 5440 Rugged');
      const osVersion = isAndroid ? 'Android 14 (OneUI 6.1)' : isMac ? 'macOS Sequoia 15.1' : 'Windows 11 Pro 24H2';
      const osBuild = isAndroid ? 'UP1A.231005.007' : isMac ? '24B91' : '26100.2161';
      
      const newDev: Device = {
        id,
        orgId,
        hostname: item.hostname || `CCI-${item.platform.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        platform: item.platform,
        osVersion,
        osBuild,
        architecture: isAndroid || isMac ? 'arm64' : 'x64',
        serialNumber: item.serialNumber || `CCI-SN-${Math.floor(100000 + Math.random() * 900000)}`,
        assetTag: item.assetTag || `CCI-AST-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Active',
        complianceStatus: 'Pass',
        assignedUser: item.assignedUser || 'Fleet Operator',
        assignedUserEmail: item.assignedUserEmail || 'logistics.fleet@coolaire.com.ph',
        department: item.department || 'Cold Chain Logistics & Reefer Fleet',
        branch: item.branch || 'Pasig Main Plant & Corporate HQ',
        ipAddress: `192.168.${Math.floor(10 + Math.random() * 80)}.${Math.floor(10 + Math.random() * 200)}`,
        macAddress: Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase(),
        agentVersion: 'v3.1.2-cci',
        lastCheckIn: new Date().toISOString(),
        enrolledAt: new Date().toISOString(),
        isEncrypted: true,
        firewallEnabled: true,
        antivirusActive: true,
        batteryHealth: 98,
        location: {
          latitude: 14.5842 + (Math.random() - 0.5) * 0.05,
          longitude: 121.0825 + (Math.random() - 0.5) * 0.05,
          accuracyMeters: 5,
          address: `${item.branch || 'Pasig Main Plant'}, Metro Manila`,
          insideGeofence: true,
          activeGeofenceName: 'CCI Pasig Main Plant & Corporate HQ',
          temperatureCelsius: isAndroid ? -19.5 : 24.0,
          speedKmh: 0,
          cargoStatus: isAndroid ? 'Reefer Van Fleet Unit' : 'Engineering Workstation',
          lastUpdated: new Date().toISOString(),
        },
        hardware: {
          cpu: isAndroid ? 'Samsung Exynos 1380' : isMac ? 'Apple M3' : 'Intel Core i7-14700',
          cores: 8,
          memoryGb: isAndroid ? 6 : 16,
          storageTotalGb: isAndroid ? 128 : 512,
          storageAvailableGb: isAndroid ? 80 : 320,
          macAddress: '00:1A:2B:3C:4D:5E',
          ipAddress: '192.168.10.50',
          batteryLevel: 95,
          manufacturer: isAndroid ? 'Samsung' : isMac ? 'Apple Inc.' : 'Dell Inc.',
          model,
        },
        installedApps: [
          { id: 'app-01', name: 'Coolaire ColdTrace Fleet Telematics', publisher: 'Coolaire Consolidated Inc.', version: '4.2.1-prod', isApproved: true },
          { id: 'app-02', name: 'CrowdStrike Falcon Sensor', publisher: 'CrowdStrike Inc.', version: '7.18.18204.0', isApproved: true },
        ],
        appliedPolicyIds: ['pol-sec-01'],
      };

      newDevices.push(newDev);
      successCount++;

      try {
        await setDoc(doc(db, 'devices', id), newDev);
      } catch (e) {
        // Local fallback
      }
    }

    setDevices(prev => [...newDevices, ...prev]);
    recordAudit('BULK_DEVICE_ENROLL', `Bulk enrolled ${successCount} endpoints into Coolaire fleet`, 'devices', 'bulk');
    return successCount;
  };

  // Clear Database Implementation
  const clearDatabase = async (mode: 'wipe_all' | 'reset_seed' | 'clear_queue') => {
    if (mode === 'wipe_all') {
      for (const d of devices) {
        try { await deleteDoc(doc(db, 'devices', d.id)); } catch {}
      }
      for (const c of commands) {
        try { await deleteDoc(doc(db, 'commands', c.id)); } catch {}
      }
      setDevices([]);
      setCommands([]);
      setSecurityAlerts([]);
      recordAudit('DATABASE_WIPE_ALL', 'Wiped all devices, active commands, and alerts (Clean Slate)', 'system', 'database');
    } else if (mode === 'reset_seed') {
      setDevices(INITIAL_DEVICES);
      setDeviceGroups(INITIAL_DEVICE_GROUPS);
      setPolicies(INITIAL_POLICIES);
      setComplianceRules(INITIAL_COMPLIANCE_RULES);
      setPackages(INITIAL_PACKAGES);
      setVerifiedSoftware(INITIAL_VERIFIED_SOFTWARE);
      setGeofences(INITIAL_GEOFENCES);
      setDeployments(INITIAL_DEPLOYMENTS);
      setCommands(INITIAL_COMMANDS);
      setPatches(INITIAL_PATCHES);
      setOrganization(INITIAL_ORG);

      for (const d of INITIAL_DEVICES) {
        try { await setDoc(doc(db, 'devices', d.id), d); } catch {}
      }
      for (const g of INITIAL_GEOFENCES) {
        try { await setDoc(doc(db, 'geofences', g.id), g); } catch {}
      }
      recordAudit('DATABASE_RESET_SEED', 'Reset database to authentic Coolaire Consolidated Inc. (CCI) enterprise seed state', 'system', 'database');
    } else if (mode === 'clear_queue') {
      for (const c of commands) {
        try { await deleteDoc(doc(db, 'commands', c.id)); } catch {}
      }
      setCommands([]);
      recordAudit('DATABASE_CLEAR_QUEUE', 'Purged all command queues and execution results', 'commands', 'all');
    }
  };

  // Deploy Verified Software
  const deployVerifiedSoftware = async (
    softwareId: string, 
    targetGroupId: string, 
    ring: DeploymentJob['ring'] = 'Ring 1 (Staged)'
  ): Promise<string> => {
    const soft = verifiedSoftware.find(s => s.id === softwareId);
    if (!soft) throw new Error('Software package not found in catalog');

    const pkgId = `pkg-${soft.packageId.toLowerCase()}`;
    const newPkg: ApplicationPackage = {
      id: pkgId,
      orgId,
      name: soft.name,
      publisher: soft.publisher,
      version: soft.version,
      platform: soft.platform,
      architecture: 'x64',
      hashSha256: soft.hashSha256,
      fileSizeBytes: 75000000,
      downloadUrl: soft.officialUrl,
      installArguments: soft.silentInstallCmd,
      uninstallArguments: soft.uninstallCmd,
      approvalStatus: 'approved',
      createdAt: new Date().toISOString(),
      createdBy: userProfile.email,
    };

    setPackages(prev => [newPkg, ...prev]);

    const depId = `dep-${Date.now().toString(36)}`;
    const newDeployment: DeploymentJob = {
      id: depId,
      orgId,
      packageId: pkgId,
      packageName: soft.name,
      version: soft.version,
      targetGroupIds: [targetGroupId],
      targetDeviceIds: ['dev-win-01', 'dev-win-02'],
      ring,
      status: 'InProgress',
      totalDevices: 2,
      succeededCount: 2,
      failedCount: 0,
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: userProfile.email,
    };

    setDeployments(prev => [newDeployment, ...prev]);
    recordAudit('VERIFIED_SOFTWARE_DEPLOY', `Initiated verified deployment for ${soft.name} via ${soft.source}`, 'deployments', depId);

    // Also update installedApps on target devices
    setDevices(prev => prev.map(d => ({
      ...d,
      installedApps: [
        ...d.installedApps.filter(a => a.name !== soft.name),
        { id: `app-${Date.now()}`, name: soft.name, publisher: soft.publisher, version: soft.version, isApproved: true }
      ]
    })));

    return depId;
  };

  // Windows Update actions
  const triggerWindowsUpdateScan = async (deviceId?: string) => {
    if (deviceId) {
      await dispatchCommand(deviceId, 'windows_update_scan');
    } else {
      // Fleet-wide scan
      for (const d of devices.filter(dev => dev.platform === 'windows')) {
        await dispatchCommand(d.id, 'windows_update_scan');
      }
    }
  };

  const approvePatch = async (patchId: string) => {
    setPatches(prev => prev.map(p => p.id === patchId ? { ...p, approvalStatus: 'Approved' } : p));
    recordAudit('PATCH_APPROVE', `Approved OS Security Patch ${patchId}`, 'patches', patchId);
  };

  const installPatchOnFleet = async (patchId: string) => {
    const patch = patches.find(p => p.id === patchId);
    if (!patch) return;

    for (const d of devices.filter(dev => dev.platform === patch.platform)) {
      await dispatchCommand(d.id, 'windows_update_install', { kbNumber: patch.kbNumber, patchTitle: patch.title });
    }

    setPatches(prev => prev.map(p => p.id === patchId ? { ...p, installedCount: p.installedCount + p.missingCount, missingCount: 0 } : p));
    recordAudit('PATCH_DEPLOY_FLEET', `Deployed ${patch.kbNumber} across fleet with auto-reboot orchestration`, 'patches', patchId);
  };

  // Geofence Actions
  const createGeofence = async (geoData: Omit<Geofence, 'id' | 'createdAt'>): Promise<string> => {
    const id = `geo-${Date.now().toString(36)}`;
    const newFence: Geofence = {
      ...geoData,
      id,
      createdAt: new Date().toISOString(),
    };
    setGeofences(prev => [...prev, newFence]);
    recordAudit('GEOFENCE_CREATE', `Created geofence boundary: ${newFence.name} (${newFence.radiusMeters}m)`, 'geofences', id);

    try {
      await setDoc(doc(db, 'geofences', id), newFence);
    } catch (e) {
      // Local fallback
    }

    return id;
  };

  const updateGeofence = async (geofenceId: string, updates: Partial<Geofence>) => {
    setGeofences(prev => prev.map(g => g.id === geofenceId ? { ...g, ...updates } : g));
    recordAudit('GEOFENCE_UPDATE', `Updated geofence ${geofenceId}`, 'geofences', geofenceId);
    try {
      await updateDoc(doc(db, 'geofences', geofenceId), updates);
    } catch (e) {
      // Local fallback
    }
  };

  const deleteGeofence = async (geofenceId: string) => {
    setGeofences(prev => prev.filter(g => g.id !== geofenceId));
    recordAudit('GEOFENCE_DELETE', `Deleted geofence ${geofenceId}`, 'geofences', geofenceId);
    try {
      await deleteDoc(doc(db, 'geofences', geofenceId));
    } catch (e) {
      // Local fallback
    }
  };

  // Policies
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
    try {
      await setDoc(doc(db, 'policies', id), newPolicy);
    } catch (e) {}
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

  const exportCsv = (dataType: 'devices' | 'compliance' | 'audit' | 'commands' | 'patches' | 'geofences') => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (dataType === 'devices') {
      headers = ['ID', 'Hostname', 'Platform', 'OS Version', 'Status', 'Compliance', 'User', 'Department', 'IP Address', 'Geofence Status', 'Last Check-In'];
      rows = devices.map(d => [
        d.id, d.hostname, d.platform, d.osVersion, d.status, d.complianceStatus, d.assignedUser, d.department, d.ipAddress,
        d.location?.insideGeofence ? 'Inside' : 'Breached/Outside', d.lastCheckIn
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
    } else if (dataType === 'patches') {
      headers = ['KB Number', 'Title', 'Platform', 'Severity', 'CVSS', 'Installed Count', 'Missing Count', 'Approval Status'];
      rows = patches.map(p => [
        p.kbNumber, p.title, p.platform, p.severity, String(p.cvssScore || 'N/A'), String(p.installedCount), String(p.missingCount), p.approvalStatus
      ]);
    } else if (dataType === 'geofences') {
      headers = ['Fence ID', 'Name', 'Latitude', 'Longitude', 'Radius (Meters)', 'Action On Breach', 'Status'];
      rows = geofences.map(g => [
        g.id, g.name, String(g.latitude), String(g.longitude), String(g.radiusMeters), g.actionOnBreach, g.enabled ? 'Enabled' : 'Disabled'
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
        verifiedSoftware,
        geofences,
        deployments,
        commands,
        securityAlerts,
        auditEvents,
        enrollmentTokens,
        patches,
        isLoading,
        isOnline,
        isFirestoreSynced,
        firestoreDocCounts,
        dispatchCommand,
        approveCommand,
        cancelCommand,
        executeCommandNow,
        executeRemoteTerminal,
        createDevice,
        updateDevice,
        deleteDevice,
        updateDeviceLocation,
        createPolicy,
        updatePolicy,
        createDeviceGroup,
        createPackage,
        deployVerifiedSoftware,
        createDeployment,
        triggerWindowsUpdateScan,
        approvePatch,
        installPatchOnFleet,
        createGeofence,
        updateGeofence,
        deleteGeofence,
        resolveAlert,
        createEnrollmentToken,
        revokeEnrollmentToken,
        bulkEnrollDevices,
        clearDatabase,
        exportCsv,
        syncAllHeartbeats,
        syncToFirestoreNow,
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
