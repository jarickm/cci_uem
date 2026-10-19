import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Terminal, Monitor, Lock, Power, 
  AlertTriangle, RefreshCw, Play, CornerDownLeft, Maximize2 
} from 'lucide-react';
import { Device } from '../../types/uem';
import { useUEM } from '../../context/UEMContext';

interface RemoteTerminalModalProps {
  device: Device;
  onClose: () => void;
}

export const RemoteTerminalModal: React.FC<RemoteTerminalModalProps> = ({ device, onClose }) => {
  const { executeRemoteTerminal, dispatchCommand } = useUEM();
  const [activeMode, setActiveMode] = useState<'terminal' | 'screen'>('terminal');
  const [inputCommand, setInputCommand] = useState('');
  const [history, setHistory] = useState<Array<{ cmd: string; output: string; time: string; exitCode: number }>>([
    {
      cmd: 'manage-bde -status',
      output: `BitLocker Drive Encryption: Configuration Tool version 10.0.22621
Volume C: [OSDisk]
    Conversion Status:    Fully Encrypted
    Percentage Encrypted: 100.0%
    Encryption Method:    XTS-AES 256
    Protection Status:    Protection On
    Lock Status:          Unlocked`,
      time: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(),
      exitCode: 0,
    }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleRunCommand = async (cmdToRun: string) => {
    if (!cmdToRun.trim() || isExecuting) return;
    setIsExecuting(true);
    setInputCommand('');

    const res = await executeRemoteTerminal(device.id, cmdToRun);
    setHistory(prev => [
      ...prev,
      {
        cmd: cmdToRun,
        output: res.stdout + (res.stderr ? `\nSTDERR: ${res.stderr}` : ''),
        time: new Date().toLocaleTimeString(),
        exitCode: res.exitCode,
      }
    ]);
    setIsExecuting(false);
  };

  const quickMacros = [
    { label: 'Get-Process', cmd: 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 10' },
    { label: 'ipconfig /all', cmd: 'ipconfig /all' },
    { label: 'BitLocker Status', cmd: 'manage-bde -status C:' },
    { label: 'systeminfo', cmd: 'systeminfo' },
    { label: 'Scan Windows Updates', cmd: 'USOClient StartScan' },
    { label: 'Installed Apps', cmd: 'Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[86vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
        
        {/* Terminal Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">
                Remote Shell Session — {device.hostname} ({device.ipAddress})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold font-mono">
                SECURE TLS-v1.3
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveMode('terminal')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  activeMode === 'terminal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Shell Terminal
              </button>
              <button
                onClick={() => setActiveMode('screen')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  activeMode === 'screen' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Screen View
              </button>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Command Macro Toolbar */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 text-xs scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Macros:</span>
          {quickMacros.map(macro => (
            <button
              key={macro.label}
              onClick={() => handleRunCommand(macro.cmd)}
              disabled={isExecuting}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 font-mono text-[11px] shrink-0 transition-colors"
            >
              {macro.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        {activeMode === 'terminal' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
            {/* Terminal Output Stream */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-4 scrollbar-thin scrollbar-thumb-slate-800 text-slate-300">
              <div className="text-slate-400 text-[11px]">
                Microsoft Windows [Version 10.0.22631.3447]<br />
                (c) Microsoft Corporation. All rights reserved.<br />
                Vanguard UEM Remote Agent v2.6.4 Authenticated Session Established.<br />
                ----------------------------------------------------------------------
              </div>

              {history.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <span className="text-slate-400">PS C:\Windows\system32&gt;</span>
                    <span className="text-white font-bold">{item.cmd}</span>
                    <span className="text-[10px] text-slate-400 ml-auto font-sans">{item.time}</span>
                  </div>
                  <pre className="text-slate-300 whitespace-pre-wrap pl-4 border-l-2 border-slate-800 text-[11px]">
                    {item.output}
                  </pre>
                </div>
              ))}

              {isExecuting && (
                <div className="flex items-center gap-2 text-amber-400 animate-pulse">
                  <span>PS C:\Windows\system32&gt;</span>
                  <span>Executing remote instruction...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-3 shrink-0">
              <span className="font-mono text-indigo-400 text-xs font-bold pl-2">PS C:&gt;</span>
              <input
                type="text"
                placeholder="Type command (e.g. Get-Process, ipconfig, systeminfo)..."
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunCommand(inputCommand);
                }}
                disabled={isExecuting}
                className="flex-1 bg-transparent border-0 text-white font-mono text-xs focus:outline-none placeholder-slate-400"
              />
              <button
                onClick={() => handleRunCommand(inputCommand)}
                disabled={isExecuting || !inputCommand.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Run</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Live Screen View Mode */
          <div className="flex-1 flex flex-col p-6 items-center justify-center bg-slate-950 space-y-4">
            <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
              <div className="h-7 bg-slate-950 px-3 flex items-center justify-between border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                <span>{device.hostname} — Desktop Session (1920x1080 @ 60Hz)</span>
                <span className="text-emerald-400 font-sans font-semibold">Live Feed</span>
              </div>
              <div className="flex-1 bg-slate-950/80 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Monitor className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Interactive Remote Desktop Stream Ready</h4>
                <p className="text-xs text-slate-400 max-w-md">
                  WebRTC peer channel initialized. User session active on display :0 ({device.assignedUser}).
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => dispatchCommand(device.id, 'lock')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                  >
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lock Remote Screen</span>
                  </button>
                  <button
                    onClick={() => dispatchCommand(device.id, 'restart')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                  >
                    <Power className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reboot</span>
                  </button>
                  <button
                    onClick={() => dispatchCommand(device.id, 'diagnostic_bundle')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Capture Diagnostics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
