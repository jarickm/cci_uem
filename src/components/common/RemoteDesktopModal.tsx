import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Monitor, Shield, Power, Lock, 
  Terminal, RefreshCw, Camera, Clipboard, 
  Upload, Layers, Activity, Maximize2, Minimize2, 
  Check, Play, Pause, AlertTriangle, Radio, 
  Cpu, HardDrive, Wifi, Volume2, Search, 
  Compass, Flame, Sliders, Smartphone, Laptop, Apple
} from 'lucide-react';
import { Device, CommandAction } from '../../types/uem';
import { useUEM } from '../../context/UEMContext';

interface RemoteDesktopModalProps {
  device: Device;
  onClose: () => void;
  onDispatchCommand?: (deviceId: string, action: CommandAction) => void;
}

export const RemoteDesktopModal: React.FC<RemoteDesktopModalProps> = ({ 
  device, 
  onClose,
  onDispatchCommand 
}) => {
  const { dispatchCommand, addAuditEvent } = useUEM();

  // Connection & Stream State
  const [isConnected, setIsConnected] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [controlMode, setControlMode] = useState<'interactive' | 'view_only'>('interactive');
  const [streamResolution, setStreamResolution] = useState<'1080p' | '720p' | 'native'>('1080p');
  const [fps] = useState(60);
  const [latency, setLatency] = useState(16);
  const [sessionSeconds, setSessionSeconds] = useState(38);
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // OS Desktop Interactive State
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState<'coldtrace' | 'powershell' | 'taskmgr' | 'mobile_agent'>('coldtrace');
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // PowerShell Terminal State
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'Get-Service CCIAgent',
      output: `Status   Name        DisplayName
------   ----        -----------
Running  CCIAgent    Coolaire Consolidated Inc. UEM Agent Daemon (Auto-Start: Automatic)`
    },
    {
      cmd: 'Get-ItemProperty HKLM:\\Software\\Coolaire\\ColdTrace | Select-Object ReeferTemp, CompressorStatus',
      output: `ReeferTemp CompressorStatus
---------- ----------------
-18.4°C    ACTIVE_RUNNING (Duty 78%, In-Spec)`
    }
  ]);

  // Telematics Simulation for ColdTrace
  const [reeferTemp, setReeferTemp] = useState(device.location?.temperatureCelsius ?? -18.4);
  const [compressorRunning, setCompressorRunning] = useState(true);

  // Timer for session duration and live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      // Slight jitter on latency for realism
      setLatency(14 + Math.floor(Math.random() * 6));
      // Subtle temp variation
      setReeferTemp(prev => Number((prev + (Math.random() * 0.2 - 0.1)).toFixed(1)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCaptureScreenshot = () => {
    showToast(`Remote frame captured: ${device.hostname}_${Date.now()}.png`);
    addAuditEvent({
      orgId: device.orgId,
      actorEmail: 'admin@coolaire.com.ph',
      action: 'remote_screenshot',
      targetType: 'device',
      targetId: device.id,
      targetName: device.hostname,
      details: 'Administrator captured live remote desktop frame via encrypted WebRTC channel',
    });
  };

  const handleInjectKeyCombo = (combo: string) => {
    showToast(`Injected key sequence: ${combo}`);
    if (combo === 'Win') {
      setIsStartMenuOpen(prev => !prev);
    }
    addAuditEvent({
      orgId: device.orgId,
      actorEmail: 'admin@coolaire.com.ph',
      action: 'remote_input_injection',
      targetType: 'device',
      targetId: device.id,
      targetName: device.hostname,
      details: `Injected keyboard sequence: ${combo}`,
    });
  };

  const handleSyncClipboard = () => {
    showToast('Clipboard synchronized: "CCI-AUTH-TOKEN-2026-ENCRYPTED"');
  };

  const handleRunTerminalCmd = (cmd: string) => {
    if (!cmd.trim()) return;
    let output = '';
    const c = cmd.trim().toLowerCase();

    if (c.includes('service') || c.includes('cciagent')) {
      output = `Status: Running\nService Type: WIN32_OWN_PROCESS\nStart Type: Auto (Delayed: False)\nBinary: C:\\Program Files\\Coolaire\\CCIAgent\\CCIAgent.exe --daemon\nWatchdog: Active (Respawn < 3s)`;
    } else if (c.includes('ipconfig')) {
      output = `Ethernet adapter Local Area Connection:\n   IPv4 Address. . . . . : ${device.ipAddress}\n   Subnet Mask . . . . . : 255.255.255.0\n   Default Gateway . . . : 192.168.10.1\n   DNS Servers . . . . . : 192.168.10.2 (CCI-LNX-TELEMETRY)`;
    } else if (c.includes('systeminfo')) {
      output = `Host Name:                 ${device.hostname}\nOS Name:                   Microsoft Windows 11 Enterprise\nOS Version:                ${device.osVersion}\nSystem Manufacturer:       ${device.hardware.manufacturer}\nSystem Model:              ${device.hardware.model}\nTotal Physical Memory:     ${device.hardware.memoryGb} GB`;
    } else if (c.includes('coldtrace') || c.includes('temp')) {
      output = `Coolaire ColdTrace Telematics Subsystem:\n   Sensor #1: ${reeferTemp}°C [Frozen Goods Range: -18°C to -25°C]\n   Compressor: ${compressorRunning ? 'RUNNING' : 'STANDBY'}\n   GPS Fix: Lock (${device.location?.latitude}, ${device.location?.longitude})\n   Geofence: ${device.location?.activeGeofenceName || 'Inside Corporate Hub'}`;
    } else {
      output = `PS C:\\> Executed: "${cmd}". ExitCode: 0 (OK). Execution verified by CCIAgent v3.1.2.`;
    }

    setTerminalLogs(prev => [...prev, { cmd, output }]);
    setTerminalInput('');
  };

  const isMobile = device.platform === 'android' || device.platform === 'ios';
  const isMac = device.platform === 'macos';
  const isLinux = device.platform === 'linux';

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 gap-3">
          
          {/* Endpoint Identity & Stream Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              {isMobile ? <Smartphone className="w-5 h-5" /> : isMac ? <Apple className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-100 truncate">{device.hostname}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {device.ipAddress}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isConnected ? 'LIVE WEBRTC P2P' : 'PAUSED'}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                <span>{device.hardware.manufacturer} {device.hardware.model}</span>
                <span>•</span>
                <span>User: <strong className="text-slate-300 font-medium">{device.assignedUser}</strong></span>
                <span>•</span>
                <span className="text-cyan-400 font-mono">{latency}ms ping</span>
                <span>•</span>
                <span className="text-emerald-400 font-mono">{fps} FPS</span>
              </div>
            </div>
          </div>

          {/* Quick Toolbar Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Control Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setControlMode('interactive')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  controlMode === 'interactive' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive
              </button>
              <button
                onClick={() => setControlMode('view_only')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  controlMode === 'view_only' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                View Only
              </button>
            </div>

            {/* Special Keys Dropdown/Buttons */}
            {!isMobile && (
              <div className="hidden md:flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => handleInjectKeyCombo('Ctrl+Alt+Del')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                  title="Inject Ctrl+Alt+Del"
                >
                  Ctrl+Alt+Del
                </button>
                <button
                  onClick={() => handleInjectKeyCombo('Win')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                  title="Send Windows/Super Key"
                >
                  Win
                </button>
                <button
                  onClick={() => handleInjectKeyCombo('Alt+Tab')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                  title="Cycle Windows"
                >
                  Alt+Tab
                </button>
              </div>
            )}

            {/* Screenshot Tool */}
            <button
              onClick={handleCaptureScreenshot}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              title="Capture Remote Screenshot"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Clipboard Sync */}
            <button
              onClick={handleSyncClipboard}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              title="Sync Clipboard with Remote Host"
            >
              <Clipboard className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Lock Device Command */}
            <button
              onClick={() => dispatchCommand(device.id, 'lock')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              title="Remotely Lock Screen"
            >
              <Lock className="w-4 h-4 text-amber-400" />
            </button>

            {/* Reboot Command */}
            <button
              onClick={() => dispatchCommand(device.id, 'restart')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              title="Remotely Restart Endpoint"
            >
              <Power className="w-4 h-4 text-rose-400" />
            </button>

            {/* Stats Drawer Toggle */}
            <button
              onClick={() => setShowStatsDrawer(prev => !prev)}
              className={`p-1.5 rounded-lg border transition-colors ${
                showStatsDrawer 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60'
              }`}
              title="Toggle Stream Telemetry & Stats"
            >
              <Activity className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close Remote Session"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-indigo-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Work Area: Canvas + Optional Stats Drawer */}
        <div className="flex-1 flex min-h-0 bg-slate-950 relative overflow-hidden">
          
          {/* Main Desktop Screen Container */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 overflow-hidden select-none">
            
            {/* If Mobile Platform (Android / iOS): Render Authentic Rugged Mobile Handheld */}
            {isMobile ? (
              <div className="relative w-full max-w-sm h-full max-h-[720px] bg-slate-900 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                {/* Mobile Camera Notch & Speaker */}
                <div className="h-6 bg-slate-950 flex items-center justify-center relative shrink-0">
                  <div className="w-16 h-3 bg-slate-800 rounded-full" />
                  <div className="absolute right-4 top-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>5G</span>
                    <span className="text-emerald-400 font-bold">94%</span>
                  </div>
                </div>

                {/* Mobile Screen Display */}
                <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col p-4 text-xs overflow-y-auto space-y-4">
                  {/* Status Card */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 border border-cyan-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                          CCI
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 text-xs">Coolaire Mobile UEM Agent</h4>
                          <span className="text-[10px] text-emerald-400 font-semibold">● 24/7 Always-On Daemon Active</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        AUTO-START ON
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Reefer Probe Temp</span>
                        <span className="text-lg font-bold text-cyan-400 font-mono">{reeferTemp}°C</span>
                        <span className="text-[9px] text-emerald-400 block">Frozen spec (-18°C)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">GPS Speed & Zone</span>
                        <span className="text-lg font-bold text-slate-200 font-mono">
                          {device.location?.speedKmh || 0} km/h
                        </span>
                        <span className="text-[9px] text-cyan-300 truncate block">
                          {device.location?.activeGeofenceName || 'Pasig Route'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Android Foreground Service Notification Simulation */}
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-200">CCI Endpoint Guardian Service</span>
                        <span className="text-[9px] text-slate-400 font-mono">Persistent</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        High-priority foreground daemon with BOOT_COMPLETED receiver running. Telemetry polling every 10s.
                      </p>
                    </div>
                  </div>

                  {/* In-Cab Driver Tools */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Driver Delivery Actions</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => showToast('Dispatched Reefer Temperature Check signal')}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                      >
                        <Flame className="w-4 h-4 text-cyan-400 mb-1" />
                        <span className="font-semibold block text-[11px] text-slate-200">Test Reefer</span>
                        <span className="text-[9px] text-slate-400">Probe calibration</span>
                      </button>

                      <button 
                        onClick={() => showToast('Simulated driver manifest upload to CCI ERP')}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-colors"
                      >
                        <Upload className="w-4 h-4 text-indigo-400 mb-1" />
                        <span className="font-semibold block text-[11px] text-slate-200">Sync Manifest</span>
                        <span className="text-[9px] text-slate-400">Cold delivery record</span>
                      </button>
                    </div>
                  </div>

                  {/* Remote Mobile Commands */}
                  <div className="pt-2 space-y-1.5 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Remote Administration</span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => showToast('Mobile alarm/siren sounded on handheld')}
                        className="py-1.5 px-3 rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/40 font-semibold text-[11px] flex items-center justify-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Sound Locator Siren</span>
                      </button>
                      <button
                        onClick={() => dispatchCommand(device.id, 'lock')}
                        className="py-1.5 px-3 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 font-semibold text-[11px] flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Force Lock Handheld Screen</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Bottom Navigation Bar */}
                <div className="h-10 bg-slate-950 flex items-center justify-around border-t border-slate-800 text-slate-400">
                  <div className="w-3.5 h-3.5 border-l-2 border-b-2 border-slate-400 rotate-45" />
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />
                  <div className="w-3.5 h-3.5 border-2 border-slate-400" />
                </div>
              </div>
            ) : (
              /* If Computer Platform (Windows 11 / macOS / Linux): Full Interactive Desktop Simulation */
              <div className="relative w-full h-full bg-slate-900 rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                
                {/* Desktop Wallpaper with Authentic Coolaire Enterprise Watermark */}
                <div 
                  className="flex-1 relative bg-cover bg-center overflow-hidden flex flex-col"
                  style={{
                    backgroundImage: isMac
                      ? 'linear-gradient(to bottom, #1e1e2f, #0d0f18)'
                      : 'linear-gradient(135deg, #0b1528 0%, #0d213f 50%, #091224 100%)'
                  }}
                  onClick={() => setIsStartMenuOpen(false)}
                >
                  {/* Subtle Coolaire Crest Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <div className="text-center">
                      <div className="text-8xl font-black tracking-widest text-white">CCI</div>
                      <div className="text-xl font-bold tracking-widest text-cyan-400 mt-2">COOLAIRE CONSOLIDATED INC.</div>
                    </div>
                  </div>

                  {/* Desktop App Shortcuts (Top-Left) */}
                  <div className="p-4 grid grid-flow-col grid-rows-4 gap-4 w-max z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveWindow('coldtrace'); }}
                      className="w-20 flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 text-center transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow group-hover:scale-105 transition-transform">
                        <Flame className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-shadow drop-shadow-md leading-tight">
                        ColdTrace Telematics
                      </span>
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveWindow('powershell'); }}
                      className="w-20 flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 text-center transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-500/50 flex items-center justify-center text-blue-300 shadow group-hover:scale-105 transition-transform">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-shadow drop-shadow-md leading-tight">
                        {isMac ? 'Terminal' : 'PowerShell'}
                      </span>
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveWindow('taskmgr'); }}
                      className="w-20 flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 text-center transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow group-hover:scale-105 transition-transform">
                        <Activity className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-shadow drop-shadow-md leading-tight">
                        Task Manager
                      </span>
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); showToast('Recycle Bin is empty (All endpoints compliant)'); }}
                      className="w-20 flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/10 text-center transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-600/50 flex items-center justify-center text-slate-300 shadow group-hover:scale-105 transition-transform">
                        <Layers className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-white font-medium text-shadow drop-shadow-md leading-tight">
                        This PC
                      </span>
                    </button>
                  </div>

                  {/* ACTIVE WINDOW: COOLAIRE COLDTRACE REEFER TELEMATICS */}
                  {activeWindow === 'coldtrace' && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-10 left-28 w-[640px] max-w-[85%] bg-slate-900/95 border border-cyan-500/50 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md z-20 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Window Header */}
                      <div className="px-3.5 py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-slate-100">
                            Coolaire ColdTrace™ Enterprise Telematics v4.2.1 — {device.hostname}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold font-mono">
                            CONNECTED
                          </span>
                          <button onClick={() => setActiveWindow('powershell')} className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-400" title="Minimize" />
                          <button onClick={() => setActiveWindow('powershell')} className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-400" title="Maximize" />
                          <button onClick={() => setActiveWindow('powershell')} className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-400" title="Close" />
                        </div>
                      </div>

                      {/* ColdTrace Body */}
                      <div className="p-4 space-y-4 text-xs">
                        <div className="grid grid-cols-3 gap-3">
                          {/* Live Temperature Gauge */}
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Box Temp (Sensor A)
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold font-mono text-cyan-400">{reeferTemp}°C</span>
                              <span className="text-[10px] text-emerald-400 font-medium">Optimal</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Frozen Setpoint: -20.0°C
                            </span>
                          </div>

                          {/* Compressor Status */}
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Compressor Duty
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold font-mono text-emerald-400">
                                {compressorRunning ? '78%' : 'OFF'}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-semibold">Running</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Suction: 18 psi • Head: 240 psi
                            </span>
                          </div>

                          {/* Geofence & Location */}
                          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              GPS Geofence Status
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-slate-200 truncate">
                                {device.location?.activeGeofenceName || 'Pasig Hub'}
                              </span>
                            </div>
                            <span className="text-[10px] text-cyan-400 font-mono block">
                              Lat: {device.location?.latitude ?? 14.5841}, Lon: {device.location?.longitude ?? 121.0827}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Cold-Chain Controls */}
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="text-xs text-slate-300">
                              Refrigeration Telematics In-Cab Diagnostics
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setCompressorRunning(prev => !prev);
                                showToast(`Toggled compressor cycle: ${!compressorRunning ? 'START' : 'IDLE'}`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
                            >
                              {compressorRunning ? 'Cycle Defrost' : 'Start Compressor'}
                            </button>
                            <button
                              onClick={() => showToast('Dispatched ColdTrace Calibration Routine to sensor')}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                            >
                              Sensor Ping
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE WINDOW: POWERSHELL / TERMINAL */}
                  {activeWindow === 'powershell' && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-14 left-36 w-[660px] max-w-[85%] bg-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-25 font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Terminal Window Header */}
                      <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-bold text-slate-200 font-sans">
                            Administrator: Windows PowerShell (CCI Enterprise Terminal)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setActiveWindow('coldtrace')} className="w-3 h-3 rounded-full bg-amber-500/80" />
                          <button onClick={() => setActiveWindow('coldtrace')} className="w-3 h-3 rounded-full bg-emerald-500/80" />
                          <button onClick={() => setActiveWindow('coldtrace')} className="w-3 h-3 rounded-full bg-rose-500/80" />
                        </div>
                      </div>

                      {/* PowerShell Output Body */}
                      <div className="p-4 h-64 overflow-y-auto space-y-3 text-slate-300">
                        <div className="text-slate-500 text-[11px]">
                          Windows PowerShell<br />
                          Copyright (C) Microsoft Corporation. All rights reserved.<br />
                          Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows<br />
                          Connected to {device.hostname} ({device.ipAddress}) via Secure WebRTC Tunnel.<br />
                          -------------------------------------------------------------------------------
                        </div>

                        {terminalLogs.map((log, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="text-blue-400 font-bold">
                              PS C:\Windows\system32&gt; <span className="text-white">{log.cmd}</span>
                            </div>
                            <pre className="text-slate-300 whitespace-pre-wrap pl-3 border-l border-slate-800 text-[11px]">
                              {log.output}
                            </pre>
                          </div>
                        ))}
                      </div>

                      {/* PowerShell Quick Macros */}
                      <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
                        <span className="text-slate-500 uppercase font-sans font-bold">Quick:</span>
                        <button
                          onClick={() => handleRunTerminalCmd('Get-Service CCIAgent')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        >
                          Check AutoStart Service
                        </button>
                        <button
                          onClick={() => handleRunTerminalCmd('ipconfig')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        >
                          ipconfig
                        </button>
                        <button
                          onClick={() => handleRunTerminalCmd('systeminfo')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        >
                          systeminfo
                        </button>
                        <button
                          onClick={() => handleRunTerminalCmd('Get-ItemProperty HKLM:\\Software\\Coolaire\\ColdTrace')}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                        >
                          ColdTrace Telematics
                        </button>
                      </div>

                      {/* Input line */}
                      <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                        <span className="text-blue-400 font-bold">PS C:\&gt;</span>
                        <input
                          type="text"
                          placeholder="Type command (e.g. Get-Service CCIAgent, restart-service, etc.)..."
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRunTerminalCmd(terminalInput);
                          }}
                          className="flex-1 bg-transparent border-0 text-white font-mono text-xs focus:outline-none placeholder-slate-500"
                        />
                        <button
                          onClick={() => handleRunTerminalCmd(terminalInput)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-semibold"
                        >
                          Run
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE WINDOW: TASK MANAGER */}
                  {activeWindow === 'taskmgr' && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-16 left-48 w-[620px] max-w-[85%] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Window Header */}
                      <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-slate-100">
                            Task Manager — {device.hostname}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setActiveWindow('coldtrace')} className="w-3 h-3 rounded-full bg-rose-500/80" />
                        </div>
                      </div>

                      {/* Task Manager Body */}
                      <div className="p-4 space-y-3 text-xs">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">CPU</span>
                            <span className="text-base font-bold text-emerald-400 font-mono">14%</span>
                            <span className="text-[9px] text-slate-500">2.80 GHz</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Memory</span>
                            <span className="text-base font-bold text-indigo-400 font-mono">
                              5.8 / {device.hardware.memoryGb} GB
                            </span>
                            <span className="text-[9px] text-slate-500">36% In Use</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Disk (C:)</span>
                            <span className="text-base font-bold text-cyan-400 font-mono">2%</span>
                            <span className="text-[9px] text-slate-500">NVMe SSD</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Network</span>
                            <span className="text-base font-bold text-amber-400 font-mono">4.2 Mbps</span>
                            <span className="text-[9px] text-slate-500">RDP Stream</span>
                          </div>
                        </div>

                        {/* Process Table with Auto-Start Service highlighted */}
                        <div className="rounded-lg border border-slate-800 overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                              <tr>
                                <th className="px-3 py-1.5">Process / Service Name</th>
                                <th className="px-3 py-1.5">Status</th>
                                <th className="px-3 py-1.5">CPU</th>
                                <th className="px-3 py-1.5">Memory</th>
                                <th className="px-3 py-1.5 text-right">Startup Impact</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                              <tr className="bg-indigo-950/30 text-indigo-200 font-semibold">
                                <td className="px-3 py-1.5 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>CCIAgent.exe (UEM Daemon)</span>
                                </td>
                                <td className="px-3 py-1.5 text-emerald-400">Running</td>
                                <td className="px-3 py-1.5">0.1%</td>
                                <td className="px-3 py-1.5">24.5 MB</td>
                                <td className="px-3 py-1.5 text-right text-emerald-400">Auto-Start Service</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-1.5 text-slate-300">ColdTraceMonitor.exe</td>
                                <td className="px-3 py-1.5 text-emerald-400">Running</td>
                                <td className="px-3 py-1.5">1.2%</td>
                                <td className="px-3 py-1.5">62.8 MB</td>
                                <td className="px-3 py-1.5 text-right text-slate-400">Low</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-1.5 text-slate-300">CrowdStrikeFalcon.exe</td>
                                <td className="px-3 py-1.5 text-emerald-400">Running</td>
                                <td className="px-3 py-1.5">0.4%</td>
                                <td className="px-3 py-1.5">48.1 MB</td>
                                <td className="px-3 py-1.5 text-right text-slate-400">Medium</td>
                              </tr>
                              <tr>
                                <td className="px-3 py-1.5 text-slate-300">System</td>
                                <td className="px-3 py-1.5 text-emerald-400">Running</td>
                                <td className="px-3 py-1.5">1.8%</td>
                                <td className="px-3 py-1.5">128.0 MB</td>
                                <td className="px-3 py-1.5 text-right text-slate-400">System</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INTERACTIVE START MENU */}
                  {isStartMenuOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 w-96 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-4 flex flex-col space-y-4 backdrop-blur-xl z-30 animate-in fade-in slide-in-from-bottom-4 duration-150"
                    >
                      {/* Search Bar inside Start Menu */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Type here to search apps, files, settings..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Pinned Applications */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Pinned Applications
                        </span>
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                          <button
                            onClick={() => { setActiveWindow('coldtrace'); setIsStartMenuOpen(false); }}
                            className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-slate-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 flex items-center justify-center text-cyan-400">
                              <Flame className="w-4 h-4" />
                            </div>
                            <span className="truncate w-full">ColdTrace</span>
                          </button>

                          <button
                            onClick={() => { setActiveWindow('powershell'); setIsStartMenuOpen(false); }}
                            className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-slate-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400">
                              <Terminal className="w-4 h-4" />
                            </div>
                            <span className="truncate w-full">PowerShell</span>
                          </button>

                          <button
                            onClick={() => { setActiveWindow('taskmgr'); setIsStartMenuOpen(false); }}
                            className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-slate-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                              <Activity className="w-4 h-4" />
                            </div>
                            <span className="truncate w-full">Task Manager</span>
                          </button>

                          <button
                            onClick={() => { showToast('Launched Remote Diagnostic Tool'); setIsStartMenuOpen(false); }}
                            className="p-2 rounded-xl hover:bg-slate-800 flex flex-col items-center gap-1 text-slate-200 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-amber-600/30 flex items-center justify-center text-amber-400">
                              <Shield className="w-4 h-4" />
                            </div>
                            <span className="truncate w-full">CCIAgent</span>
                          </button>
                        </div>
                      </div>

                      {/* Start Menu Footer with User & Power */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {device.assignedUser.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-slate-200">{device.assignedUser}</span>
                        </div>

                        <button
                          onClick={() => {
                            dispatchCommand(device.id, 'restart');
                            setIsStartMenuOpen(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Restart Computer"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Taskbar at Bottom (Windows 11 Centered Layout) */}
                  <div className="h-11 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between px-4 z-20 backdrop-blur-md">
                    
                    {/* Left: Quick System Status */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="hidden sm:inline">Coolaire Enterprise Secure Host</span>
                    </div>

                    {/* Center: Windows 11 Centered App Icons */}
                    <div className="flex items-center gap-1.5">
                      {/* Windows Start Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsStartMenuOpen(prev => !prev); }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isStartMenuOpen ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-cyan-400'
                        }`}
                        title="Start Menu"
                      >
                        <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                          <span className="bg-cyan-400 rounded-sm" />
                          <span className="bg-cyan-400 rounded-sm" />
                          <span className="bg-cyan-400 rounded-sm" />
                          <span className="bg-cyan-400 rounded-sm" />
                        </div>
                      </button>

                      {/* ColdTrace Icon */}
                      <button
                        onClick={() => setActiveWindow('coldtrace')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          activeWindow === 'coldtrace' ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400' : 'hover:bg-slate-800 text-slate-400'
                        }`}
                        title="Coolaire ColdTrace"
                      >
                        <Flame className="w-4 h-4 text-cyan-400" />
                      </button>

                      {/* PowerShell Icon */}
                      <button
                        onClick={() => setActiveWindow('powershell')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          activeWindow === 'powershell' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' : 'hover:bg-slate-800 text-slate-400'
                        }`}
                        title="Windows PowerShell"
                      >
                        <Terminal className="w-4 h-4 text-blue-400" />
                      </button>

                      {/* Task Manager Icon */}
                      <button
                        onClick={() => setActiveWindow('taskmgr')}
                        className={`p-1.5 rounded-lg transition-colors ${
                          activeWindow === 'taskmgr' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'hover:bg-slate-800 text-slate-400'
                        }`}
                        title="Task Manager"
                      >
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>

                    {/* Right: System Tray & Clock */}
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span title="CCIAgent Service Running"><Shield className="w-3.5 h-3.5 text-indigo-400" /></span>
                        <span title="Connected to CCI LAN"><Wifi className="w-3.5 h-3.5 text-emerald-400" /></span>
                        <span title="Audio 100%"><Volume2 className="w-3.5 h-3.5 text-slate-400" /></span>
                      </div>
                      <span className="font-mono text-slate-200">{currentTime}</span>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Telemetry & Streaming Stats Drawer */}
          {showStatsDrawer && (
            <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 space-y-4 shrink-0 overflow-y-auto text-xs animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Session Stream Diagnostics</span>
                </span>
                <button onClick={() => setShowStatsDrawer(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quality & Encoding Details */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Transport Pipeline</span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protocol:</span>
                    <span className="text-emerald-400">WebRTC / SRTP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Video Codec:</span>
                    <span className="text-slate-200">H.264 High 4:2:0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bitrate:</span>
                    <span className="text-cyan-400">4.2 Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Packet Loss:</span>
                    <span className="text-emerald-400">0.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Round-Trip Latency:</span>
                    <span className="text-cyan-400">{latency} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session Duration:</span>
                    <span className="text-slate-200">
                      {Math.floor(sessionSeconds / 60).toString().padStart(2, '0')}:
                      {(sessionSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endpoint Auto-Start Service Telemetry */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Agent Daemon Status</span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auto-Start:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE (Enabled)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service:</span>
                    <span className="text-slate-200 font-mono">
                      {device.autoStartConfig?.serviceName || 'CCIAgent'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Watchdog:</span>
                    <span className="text-emerald-400">Respawn &lt; 3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Boot Trigger:</span>
                    <span className="text-slate-300">Pre-Logon System</span>
                  </div>
                </div>
              </div>

              {/* Stream Resolution Switcher */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stream Quality</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['1080p', '720p', 'native'] as const).map(res => (
                    <button
                      key={res}
                      onClick={() => setStreamResolution(res)}
                      className={`py-1 rounded text-center font-semibold text-[11px] transition-colors ${
                        streamResolution === res 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {res.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
