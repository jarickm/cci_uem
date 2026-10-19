import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // In-memory active command and telemetry store for real agent communication
  const agentTokens = new Set(['APEX-WIN-89240-SEC', 'APEX-MAC-11492-DEV', 'APEX-LIVE-DEMO']);
  const registeredDevices = new Map<string, any>();
  const queuedCommands = new Map<string, any[]>();

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'Vanguard UEM Backend Gateway',
      version: '2.6.4-enterprise',
      timestamp: new Date().toISOString(),
      activeEnrolledCount: registeredDevices.size,
    });
  });

  // 1. Windows PowerShell Agent Installer
  app.get('/api/agent/installer/windows', (req: Request, res: Response) => {
    const token = req.query.token || 'APEX-WIN-89240-SEC';
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const agentScriptPath = path.join(__dirname, 'agent', 'windows', 'VanguardAgent.ps1');

    let scriptContent = '';
    if (fs.existsSync(agentScriptPath)) {
      scriptContent = fs.readFileSync(agentScriptPath, 'utf-8');
      scriptContent = scriptContent.replace(
        /\$ServerUrl = "[^"]*"/,
        `$ServerUrl = "${serverUrl}"`
      );
    } else {
      scriptContent = `# Vanguard UEM Agent\nWrite-Host "Vanguard UEM Windows Agent Connected to ${serverUrl}"`;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="VanguardAgent.ps1"');
    res.send(scriptContent);
  });

  // 2. macOS Bash / LaunchDaemon Installer
  app.get('/api/agent/installer/macos', (req: Request, res: Response) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const token = (req.query.token as string) || 'APEX-MAC-11492-DEV';

    const macScript = `#!/bin/bash
# Vanguard UEM macOS Endpoint Daemon Installer
set -e

SERVER_URL="${serverUrl}"
TOKEN="${token}"
AGENT_DIR="/Library/Application Support/VanguardUEM"
PLIST_PATH="/Library/LaunchDaemons/com.vanguard.uem.agent.plist"

echo "==> Vanguard UEM macOS Agent Onboarding <=="
sudo mkdir -p "$AGENT_DIR"

# Generate device ID
DEVICE_ID="dev-mac-$(uuidgen | tr '[:upper:]' '[:lower:]' | cut -c1-8)"
HOSTNAME=$(hostname -s)
SERIAL=$(system_profiler SPHardwareDataType | awk '/Serial/ {print $4}')
OS_VER=$(sw_vers -productVersion)

echo "==> Enrolling device $HOSTNAME ($SERIAL) to $SERVER_URL..."
curl -s -X POST "$SERVER_URL/api/agent/enroll" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "org-apex-01",
    "token": "'"$TOKEN"'",
    "deviceId": "'"$DEVICE_ID"'",
    "hostname": "'"$HOSTNAME"'",
    "platform": "macos",
    "serialNumber": "'"$SERIAL"'",
    "osVersion": "macOS '"$OS_VER"'"
  }'

echo "==> Enrolled successfully. Vanguard UEM Daemon active."
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="install_mac.sh"');
    res.send(macScript);
  });

  // 3. Linux Systemd Agent Installer
  app.get('/api/agent/installer/linux', (req: Request, res: Response) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const token = (req.query.token as string) || 'APEX-LNX-SEC';

    const linuxScript = `#!/bin/bash
# Vanguard UEM Linux Systemd Daemon Installer
set -e

SERVER_URL="${serverUrl}"
TOKEN="${token}"
DEVICE_ID="dev-lnx-$(cat /proc/sys/kernel/random/uuid | cut -c1-8)"
HOSTNAME=$(hostname -f 2>/dev/null || hostname)
OS_VER=$(grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"')

echo "==> Vanguard UEM Linux Agent Onboarding <=="
echo "==> Target Gateway: $SERVER_URL"

curl -s -X POST "$SERVER_URL/api/agent/enroll" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "org-apex-01",
    "token": "'"$TOKEN"'",
    "deviceId": "'"$DEVICE_ID"'",
    "hostname": "'"$HOSTNAME"'",
    "platform": "linux",
    "osVersion": "'"$OS_VER"'"
  }'

echo "==> Vanguard UEM Linux Service enrolled successfully."
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="install_linux.sh"');
    res.send(linuxScript);
  });

  // 4. Apple MDM Enrollment Mobileconfig Profile (.mobileconfig)
  app.get('/api/agent/mobileconfig', (req: Request, res: Response) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const orgName = 'Apex Global Industries';

    const mobileconfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key>
      <string>com.apple.mdm</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>PayloadIdentifier</key>
      <string>com.vanguard.uem.mdm</string>
      <key>PayloadUUID</key>
      <string>4B8D56A9-95E0-4D54-94E5-B4C2518C4402</string>
      <key>PayloadDisplayName</key>
      <string>Vanguard Enterprise MDM Profile</string>
      <key>ServerURL</key>
      <string>${serverUrl}/api/agent/mdm/server</string>
      <key>CheckInURL</key>
      <string>${serverUrl}/api/agent/mdm/checkin</string>
      <key>AccessRights</key>
      <integer>8191</integer>
      <key>Topic</key>
      <string>com.apple.mgmt.vanguard.uem</string>
    </dict>
  </array>
  <key>PayloadDisplayName</key>
  <string>${orgName} Device Management</string>
  <key>PayloadIdentifier</key>
  <string>com.vanguard.uem.enrollment</string>
  <key>PayloadOrganization</key>
  <string>${orgName}</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>A51B7892-29D4-49D0-A46F-92C8B715C601</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;

    res.setHeader('Content-Type', 'application/x-apple-aspen-config');
    res.setHeader('Content-Disposition', 'attachment; filename="VanguardEnrollment.mobileconfig"');
    res.send(mobileconfig);
  });

  // 5. Android Enterprise QR Provisioning Payload
  app.get('/api/agent/android-qr', (req: Request, res: Response) => {
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const token = (req.query.token as string) || 'APEX-AND-99201';

    const qrPayload = {
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME': 'com.google.android.apps.work.clouddpc/.receivers.CloudDeviceAdminReceiver',
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM': 'gRtV3...vanguard_sig',
      'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION': `${serverUrl}/agent/android/VanguardDPC.apk`,
      'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': {
        serverUrl,
        enrollmentToken: token,
        orgId: 'org-apex-01',
      },
    };

    res.json(qrPayload);
  });

  // 6. Agent Handshake / Enrollment API
  app.post('/api/agent/enroll', (req: Request, res: Response) => {
    const { orgId, token, inventory, deviceId, hostname, platform, serialNumber, osVersion } = req.body;
    
    const assignedId = deviceId || `dev-${platform || 'win'}-${Date.now().toString(36)}`;
    const record = {
      id: assignedId,
      orgId: orgId || 'org-apex-01',
      hostname: hostname || inventory?.hostname || 'REMOTE-ENDPOINT',
      platform: platform || inventory?.platform || 'windows',
      serialNumber: serialNumber || inventory?.serialNumber || 'SN-UNKNOWN',
      osVersion: osVersion || inventory?.osVersion || 'Unknown OS',
      status: 'Active',
      lastCheckIn: new Date().toISOString(),
      inventory: inventory || {},
    };

    registeredDevices.set(assignedId, record);

    res.json({
      success: true,
      deviceId: assignedId,
      serverMessage: 'Device successfully registered in Vanguard UEM fleet.',
      assignedPolicyIds: ['pol-sec-01', 'pol-win-bitlocker'],
      nextHeartbeatSeconds: 300,
    });
  });

  // 7. Agent Check-in & Heartbeat API
  app.post('/api/agent/checkin', (req: Request, res: Response) => {
    const { deviceId, status, telemetry } = req.body;

    if (deviceId && registeredDevices.has(deviceId)) {
      const existing = registeredDevices.get(deviceId);
      existing.lastCheckIn = new Date().toISOString();
      if (telemetry) existing.inventory = telemetry;
    }

    // Retrieve pending commands for this device
    const pending = queuedCommands.get(deviceId) || [];
    queuedCommands.set(deviceId, []);

    res.json({
      acknowledged: true,
      timestamp: new Date().toISOString(),
      commandsToExecute: pending,
      geofenceStatus: 'COMPLIANT_INSIDE',
    });
  });

  // 8. Command Execution Result reporting
  app.post('/api/agent/command-result', (req: Request, res: Response) => {
    const { commandId, deviceId, exitCode, output, status } = req.body;
    console.log(`[Agent Result] Command ${commandId} from device ${deviceId} finished with exit code ${exitCode}`);
    res.json({ acknowledged: true });
  });

  // Vite development middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vanguard UEM] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
