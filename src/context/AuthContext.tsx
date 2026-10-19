import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, handleFirestoreError, OperationType } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { UserRole, UserProfile } from '../types/uem';
import { INITIAL_USER, INITIAL_ORG } from '../services/seedData';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  orgId: string;
  hasPermission: (permission: string) => boolean;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER);
  const [activeRole, setActiveRole] = useState<UserRole>('Super Administrator');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setUserProfile(prev => ({
          ...prev,
          id: user.uid,
          email: user.email || prev.email,
          displayName: user.displayName || prev.displayName,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const switchRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    setUserProfile(prev => ({ ...prev, role: newRole }));
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      // Fallback for non-blocking local demo
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
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
