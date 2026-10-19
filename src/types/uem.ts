export type Platform = 'windows' | 'macos' | 'linux' | 'android' | 'ios';

export type DeviceStatus = 
  | 'Pending' 
  | 'Enrolling' 
  | 'Active' 
  | 'Noncompliant' 
  | 'Inactive' 
  | 'Lost' 
  | 'Retiring' 
  | 'Retired' 
  | 'Failed';

export type ComplianceStatus = 'Pass' | 'Fail' | 'Unknown' | 'NotApplicable';

export type CommandAction = 
  | 'sync_inventory'
  | 'restart'
  | 'shutdown'
  | 'lock'
  | 'wipe'
  | 'diagnostic_bundle'
  | 'run_script'
  | 'install_package'
  | 'uninstall_package'
  | 'apply_policy';

export type CommandStatus = 'Pending' | 'Approved' | 'Queued' | 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';

export type UserRole = 
  | 'Super Administrator'
  | 'Organization Administrator'
  | 'IT Administrator'
  | 'Security Administrator'
  | 'Device Administrator'
  | 'Helpdesk Technician'
  | 'Department Manager'
  | 'Auditor'
  | 'Standard User';

export interface HardwareInfo {
  cpu: string;
  cores: number;
  memoryGb: number;
  storageTotalGb: number;
  storageAvailableGb: number;
  macAddress: string;
  ipAddress: string;
  batteryLevel?: number;
  biosVersion?: string;
  manufacturer: string;
  model: string;
}

export interface SoftwareApp {
  id: string;
  name: string;
  publisher: string;
  version: string;
  installedDate?: string;
  isApproved: boolean;
  isProhibited?: boolean;
}

export interface Device {
  id: string;
  orgId: string;
  hostname: string;
  platform: Platform;
  osVersion: string;
  osBuild: string;
  architecture: string;
  serialNumber: string;
  assetTag?: string;
  status: DeviceStatus;
  complianceStatus: ComplianceStatus;
  assignedUser: string;
  assignedUserEmail: string;
  department: string;
  branch: string;
  deviceGroupId?: string;
  ipAddress: string;
  macAddress: string;
  agentVersion: string;
  lastCheckIn: string;
  enrolledAt: string;
  hardware: HardwareInfo;
  installedApps: SoftwareApp[];
  appliedPolicyIds: string[];
  batteryHealth?: number;
  isEncrypted: boolean;
  firewallEnabled: boolean;
  antivirusActive: boolean;
}

export interface EnrollmentToken {
  id: string;
  orgId: string;
  token: string;
  platform: Platform;
  department: string;
  branch: string;
  deviceGroupId?: string;
  assignedUserEmail?: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  createdBy: string;
  createdAt: string;
}

export interface DeviceGroup {
  id: string;
  orgId: string;
  name: string;
  description: string;
  type: 'static' | 'dynamic';
  criteria?: {
    platform?: Platform;
    department?: string;
    minOsVersion?: string;
    complianceStatus?: ComplianceStatus;
  };
  deviceIds?: string[];
  deviceCount: number;
  createdAt: string;
}

export interface Policy {
  id: string;
  orgId: string;
  name: string;
  description: string;
  platform: Platform;
  category: 'password' | 'encryption' | 'firewall' | 'wifi' | 'restrictions' | 'updates';
  version: number;
  priority: number;
  enforcementMode: 'enforce' | 'audit_only';
  status: 'active' | 'draft' | 'archived';
  targetGroupIds: string[];
  settings: Record<string, any>;
  updatedAt: string;
  updatedBy: string;
}

export interface ApplicationPackage {
  id: string;
  orgId: string;
  name: string;
  publisher: string;
  version: string;
  platform: Platform;
  architecture: 'x64' | 'arm64' | 'universal' | 'all';
  hashSha256: string;
  fileSizeBytes: number;
  downloadUrl: string;
  installArguments: string;
  uninstallArguments: string;
  approvalStatus: 'approved' | 'pending_review' | 'rejected';
  createdAt: string;
  createdBy: string;
}

export interface DeploymentJob {
  id: string;
  orgId: string;
  packageId: string;
  packageName: string;
  version: string;
  targetGroupIds: string[];
  targetDeviceIds: string[];
  ring: 'Pilot' | 'Ring 1 (Staged)' | 'Ring 2 (Broad)' | 'Production';
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Failed' | 'Cancelled';
  totalDevices: number;
  succeededCount: number;
  failedCount: number;
  scheduledAt: string;
  createdAt: string;
  createdBy: string;
}

export interface Command {
  id: string;
  orgId: string;
  deviceId: string;
  deviceHostname: string;
  action: CommandAction;
  parameters?: Record<string, any>;
  requestedBy: string;
  status: CommandStatus;
  approvalRequired: boolean;
  approvedBy?: string;
  result?: string;
  executionLog?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ComplianceRule {
  id: string;
  orgId: string;
  name: string;
  description: string;
  platform: Platform;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  criteria: string;
  remediationAdvice: string;
  enabled: boolean;
}

export interface SecurityAlert {
  id: string;
  orgId: string;
  deviceId: string;
  deviceHostname: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditEvent {
  id: string;
  orgId: string;
  actorEmail: string;
  action: string;
  targetResource: string;
  targetId: string;
  outcome: 'Success' | 'Failure';
  timestamp: string;
  details?: string;
}

export interface Organization {
  id: string;
  name: string;
  edition: string;
  primaryContact: string;
  departments: string[];
  branches: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  orgId: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  orgId: string;
  name: string;
  description: string;
  triggerType: 'stale_check_in' | 'compliance_failed' | 'new_enrollment' | 'schedule';
  scheduleCron?: string;
  conditions: Record<string, any>;
  actionType: 'send_alert' | 'lock_device' | 'assign_group' | 'sync_inventory';
  enabled: boolean;
  lastRunAt?: string;
}

export interface PatchItem {
  id: string;
  kbNumber: string;
  title: string;
  platform: Platform;
  severity: 'Critical' | 'Important' | 'Moderate' | 'Low';
  releaseDate: string;
  installedCount: number;
  missingCount: number;
  approvalStatus: 'Approved' | 'Declined' | 'Pending';
}
