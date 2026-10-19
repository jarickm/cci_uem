import React, { useState } from 'react';
import { 
  Search, Shield, Bell, RefreshCw, UserCheck, 
  Building2, LogIn, LogOut, ChevronDown, CheckCircle2, 
  Database, Sun, Moon, Trash2, ShieldAlert, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUEM } from '../../context/UEMContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types/uem';
import { ClearDatabaseModal } from '../common/ClearDatabaseModal';

const ALL_ROLES: UserRole[] = [
  'Super Administrator',
  'Organization Administrator',
  'IT Administrator',
  'Security Administrator',
  'Device Administrator',
  'Helpdesk Technician',
  'Department Manager',
  'Auditor',
  'Standard User',
];

interface NavbarProps {
  onSearchSelect?: (deviceId: string) => void;
  onOpenClearDb?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchSelect, onOpenClearDb }) => {
  const { 
    userProfile, activeRole, switchRole, currentUser, 
    signInWithGoogle, logout, isAuthorized, unauthorizedEmail 
  } = useAuth();
  const { 
    organization, isOnline, syncAllHeartbeats, devices, 
    syncToFirestoreNow, isFirestoreSynced 
  } = useUEM();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [internalClearModalOpen, setInternalClearModalOpen] = useState(false);

  const filteredDevices = searchQuery.trim() 
    ? devices.filter(d => 
        d.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.assignedUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ipAddress.includes(searchQuery)
      ).slice(0, 5)
    : [];

  const handleManualSync = async () => {
    setIsSyncingFirestore(true);
    await syncToFirestoreNow();
    setTimeout(() => setIsSyncingFirestore(false), 1200);
  };

  const handleClearDbClick = () => {
    if (onOpenClearDb) {
      onOpenClearDb();
    } else {
      setInternalClearModalOpen(true);
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: Organization & Global Search */}
      <div className="flex items-center gap-4">
        {/* Coolaire Brand Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/60 text-slate-200">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px] tracking-wider shadow">
            CCI
          </div>
          <div className="leading-tight">
            <span className="text-xs font-bold text-slate-100">{organization.name}</span>
            <span className="text-[10px] text-cyan-400 font-medium block">Cold-Chain Unified Endpoint Platform</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-64 md:w-80">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search fleet, reefer van, user, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchQuery.trim() && filteredDevices.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Endpoints ({filteredDevices.length})
              </div>
              {filteredDevices.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    if (onSearchSelect) onSearchSelect(d.id);
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-200">{d.hostname}</p>
                    <p className="text-[10px] text-slate-400">{d.assignedUser} • {d.osVersion}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    d.complianceStatus === 'Pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {d.complianceStatus}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Theme Switcher, Clear DB, Sync, RBAC & Auth */}
      <div className="flex items-center gap-3">
        
        {/* Light / Dark Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Clear Database Quick Button */}
        <button
          onClick={handleClearDbClick}
          title="Clear or Reset Database (Admin)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden lg:inline">Clear DB</span>
        </button>

        {/* Sync Heartbeats Button */}
        <button
          onClick={syncAllHeartbeats}
          title="Poll active agent heartbeats"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors border border-slate-700/60"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Sync Fleet</span>
        </button>

        {/* Firestore Online Indicator */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-[11px] text-slate-300"
          title="Cloud Firestore Connected"
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-[10px] font-medium text-slate-300 hidden sm:inline">
            {isOnline ? 'Firestore Live' : 'Reconnecting'}
          </span>
        </div>

        {/* RBAC Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-medium transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[120px] truncate">{activeRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Test RBAC Persona</p>
                <p className="text-[10px] text-slate-400">Switch permissions to test role enforcement</p>
              </div>
              {ALL_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    activeRole === role ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span>{role}</span>
                  {activeRole === role && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Account / Auth */}
        <div className="relative">
          {currentUser ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {userProfile.displayName ? userProfile.displayName.charAt(0) : 'U'}
              </div>
              <span className="text-xs text-slate-200 font-medium max-w-[100px] truncate">
                {userProfile.displayName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
          )}

          {showUserMenu && currentUser && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-slate-200">{userProfile.displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userProfile.email}</p>
                <p className="text-[10px] text-indigo-400 mt-0.5">{activeRole}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Internal Clear Database Modal */}
      {internalClearModalOpen && (
        <ClearDatabaseModal onClose={() => setInternalClearModalOpen(false)} />
      )}
    </header>
  );
};
