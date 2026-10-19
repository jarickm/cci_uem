import React, { useState } from 'react';
import { 
  X, AlertTriangle, Trash2, RotateCcw, ShieldAlert, 
  CheckCircle2, Database, RefreshCw, Layers 
} from 'lucide-react';
import { useUEM } from '../../context/UEMContext';

interface ClearDatabaseModalProps {
  onClose: () => void;
}

export const ClearDatabaseModal: React.FC<ClearDatabaseModalProps> = ({ onClose }) => {
  const { clearDatabase, devices, commands, securityAlerts, organization } = useUEM();
  const [selectedMode, setSelectedMode] = useState<'reset_seed' | 'wipe_all' | 'clear_queue'>('reset_seed');
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const targetConfirmWord = selectedMode === 'wipe_all' ? 'WIPE' : selectedMode === 'clear_queue' ? 'PURGE' : 'RESET';
  const isConfirmValid = confirmText.trim().toUpperCase() === targetConfirmWord;

  const handleExecute = async () => {
    if (!isConfirmValid) return;
    setIsProcessing(true);
    try {
      await clearDatabase(selectedMode);
      setSuccessMessage(
        selectedMode === 'reset_seed' 
          ? 'Database reset successfully to authentic Coolaire Consolidated Inc. (CCI) enterprise seed state.'
          : selectedMode === 'wipe_all'
          ? 'All endpoints, active commands, and security alerts wiped completely from Firestore and local fleet.'
          : 'Command queue and execution history purged successfully.'
      );
      setConfirmText('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Enterprise Database Reset & Purge</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                  Admin Action
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Wipe, re-seed, or clear persistent Firestore records for {organization.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Current State Stats */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Managed Devices</span>
              <span className="text-base font-bold text-indigo-400">{devices.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Command Logs</span>
              <span className="text-base font-bold text-amber-400">{commands.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Security Alerts</span>
              <span className="text-base font-bold text-rose-400">{securityAlerts.length}</span>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2.5">
            <label className="block font-bold text-slate-200">Select Database Operation:</label>
            
            {/* Option 1: Reset to Seed */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedMode === 'reset_seed' ? 'bg-indigo-600/10 border-indigo-500 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
            }`}>
              <input
                type="radio"
                name="clear_mode"
                checked={selectedMode === 'reset_seed'}
                onChange={() => { setSelectedMode('reset_seed'); setConfirmText(''); }}
                className="mt-1 text-indigo-600"
              />
              <div>
                <span className="font-bold block flex items-center gap-1.5 text-indigo-300">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Authentic Coolaire (CCI) Enterprise Seed (Recommended)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Restores 10 managed endpoints (Reefer vans, Toughbooks, CAD laptops, servers), Philippine geofences, official verified software, and real Windows KB updates.
                </span>
              </div>
            </label>

            {/* Option 2: Wipe All Devices */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedMode === 'wipe_all' ? 'bg-rose-600/10 border-rose-500 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
            }`}>
              <input
                type="radio"
                name="clear_mode"
                checked={selectedMode === 'wipe_all'}
                onChange={() => { setSelectedMode('wipe_all'); setConfirmText(''); }}
                className="mt-1 text-rose-600"
              />
              <div>
                <span className="font-bold block flex items-center gap-1.5 text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                  Wipe All Managed Devices & Records (Clean Slate)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Completely empties all device documents, active commands, and alerts from Firestore. Leaves fleet at 0 endpoints ready for fresh manual/bulk onboarding.
                </span>
              </div>
            </label>

            {/* Option 3: Clear Command Queue */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              selectedMode === 'clear_queue' ? 'bg-amber-600/10 border-amber-500 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
            }`}>
              <input
                type="radio"
                name="clear_mode"
                checked={selectedMode === 'clear_queue'}
                onChange={() => { setSelectedMode('clear_queue'); setConfirmText(''); }}
                className="mt-1 text-amber-600"
              />
              <div>
                <span className="font-bold block flex items-center gap-1.5 text-amber-300">
                  <Database className="w-3.5 h-3.5" />
                  Purge Command Queues & Execution Logs Only
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Retains all enrolled devices, policies, and geofences, but clears remote execution history and completed/pending commands.
                </span>
              </div>
            </label>
          </div>

          {/* Success Message Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMessage}
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shrink-0"
              >
                Close
              </button>
            </div>
          )}

          {/* Safety Confirmation Input */}
          {!successMessage && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-slate-300 font-medium">
                To confirm this operation, type <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">{targetConfirmWord}</span> below:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type ${targetConfirmWord} to confirm`}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Cancel
          </button>
          
          {!successMessage && (
            <button
              disabled={!isConfirmValid || isProcessing}
              onClick={handleExecute}
              className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                isConfirmValid && !isProcessing
                  ? selectedMode === 'wipe_all'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {selectedMode === 'wipe_all' ? 'Wipe Entire Database' : selectedMode === 'clear_queue' ? 'Purge Queue' : 'Reset Database to CCI Seed'}
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
