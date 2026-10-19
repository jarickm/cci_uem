import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { UserRole, UserProfile } from '../types/uem';
import { INITIAL_USER, INITIAL_ORG, DESIGNATED_ADMINS } from '../services/seedData';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  orgId: string;
  hasPermission: (permission: string) => boolean;
  isAuthorized: boolean;
  unauthorizedEmail: string | null;
  designatedAdmins: UserProfile[];
  allowedEmails: string[];
  addAllowedEmail: (email: string) => void;
  removeAllowedEmail: (email: string) => void;
  bypassAuthForDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Super Administrator': ['all'],
  'Organization Administrator': ['org.manage', 'devices.all', 'policies.all', 'apps.all', 'commands.all', 'users.manage', 'reports.view', 'audit.view'],
  'IT Administrator': ['devices.all', 'policies.manage', 'apps.all', 'commands.all', 'reports.view'],
  'Security Administrator': ['compliance.all', 'policies.manage', 'alerts.all', 'audit.view', 'reports.view', 'devices.view'],
  'Device Administrator': ['devices.all', 'commands.safe', 'groups.manage', 'enrollment.create'],
  'Helpdesk Technician': ['devices.view', 'commands.helpdesk', 'diagnostics.view', 'reports.view'],
  'Department Manager': ['devices.dept_view', 'reports.dept_view'],
  'Auditor': ['audit.view', 'compliance.view', 'reports.view', 'devices.view'],
  'Standard User': ['devices.self_view'],
};

const DEFAULT_ALLOWED_EMAILS = [
  'jmmontojo2019@gmail.com',
  'admin.it@coolaire.com.ph',
  'secops@coolaire.com.ph'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER);
  const [activeRole, setActiveRole] = useState<UserRole>('Super Administrator');
  
  // Enterprise Access Restriction State
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [allowedEmails, setAllowedEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cci_allowed_admins');
      return saved ? JSON.parse(saved) : DEFAULT_ALLOWED_EMAILS;
    } catch {
      return DEFAULT_ALLOWED_EMAILS;
    }
  });

  const checkAuthorization = (email: string | null): boolean => {
    if (!email) return true; // Local default demo profile is allowed
    const normalized = email.toLowerCase().trim();
    // Allow designated emails or any official Coolaire domain
    if (allowedEmails.some(e => e.toLowerCase() === normalized)) return true;
    if (normalized.endsWith('@coolaire.com.ph')) return true;
    return false;
  };

  useEffect(() => {
    localStorage.setItem('cci_allowed_admins', JSON.stringify(allowedEmails));
  }, [allowedEmails]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        const authorized = checkAuthorization(user.email);
        if (authorized) {
          setIsAuthorized(true);
          setUnauthorizedEmail(null);
          // Check if user is one of the designated admins
          const existingAdmin = DESIGNATED_ADMINS.find(a => a.email.toLowerCase() === user.email?.toLowerCase());
          setUserProfile(prev => ({
            ...prev,
            id: user.uid,
            email: user.email || prev.email,
            displayName: user.displayName || existingAdmin?.displayName || prev.displayName,
            role: existingAdmin?.role || prev.role,
            avatarUrl: user.photoURL || existingAdmin?.avatarUrl || prev.avatarUrl,
          }));
        } else {
          // Flag as unauthorized
          setIsAuthorized(false);
          setUnauthorizedEmail(user.email);
        }
      } else {
        // Local state
        setIsAuthorized(true);
        setUnauthorizedEmail(null);
      }
    });

    return () => unsubscribe();
  }, [allowedEmails]);

  const addAllowedEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && !allowedEmails.includes(trimmed)) {
      setAllowedEmails(prev => [...prev, trimmed]);
    }
  };

  const removeAllowedEmail = (email: string) => {
    // Preserve primary super admin
    if (email === 'jmmontojo2019@gmail.com') return;
    setAllowedEmails(prev => prev.filter(e => e.toLowerCase() !== email.toLowerCase()));
  };

  const bypassAuthForDemo = () => {
    setIsAuthorized(true);
    setUnauthorizedEmail(null);
  };

  const switchRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    setUserProfile(prev => ({ ...prev, role: newRole }));
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Prompt account selection
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user?.email) {
        const authorized = checkAuthorization(result.user.email);
        if (!authorized) {
          setIsAuthorized(false);
          setUnauthorizedEmail(result.user.email);
        } else {
          setIsAuthorized(true);
          setUnauthorizedEmail(null);
        }
      }
    } catch (error) {
      console.error('Google Sign-in failed:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAuthorized(true);
      setUnauthorizedEmail(null);
      setUserProfile(INITIAL_USER);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    const perms = ROLE_PERMISSIONS[activeRole] || [];
    if (perms.includes('all')) return true;
    return perms.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        activeRole,
        switchRole,
        signInWithGoogle,
        logout,
        orgId: INITIAL_ORG.id,
        hasPermission,
        isAuthorized,
        unauthorizedEmail,
        designatedAdmins: DESIGNATED_ADMINS,
        allowedEmails,
        addAllowedEmail,
        removeAllowedEmail,
        bypassAuthForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
