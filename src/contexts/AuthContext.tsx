import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types';
import { DEPARTMENTS } from '@/lib/constants';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  employeeDbId?: string;
  name?: string;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Demo Credentials ────────────────────────────────────────
// Allows the platform to be demoed without a Supabase backend.
const DEMO_USERS: Record<string, AuthUser> = {
  'admin@surojbuildcon.com': {
    id: 'demo-admin-001',
    email: 'admin@surojbuildcon.com',
    role: 'admin',
    name: 'Platform Admin',
  },
  'demo@surojbuildcon.com': {
    id: 'demo-emp-001',
    email: 'demo@surojbuildcon.com',
    role: 'employee',
    name: 'Demo Employee',
    employeeId: 'SRJ-DEMO',
    departmentId: DEPARTMENTS[0].id,
  },
  // Allow any @surojbuildcon.com email as employee with dept-01
  _fallbackEmployee: {
    id: 'demo-emp-fallback',
    email: '',
    role: 'employee',
    name: 'Suroj Employee',
    employeeId: 'SRJ-0000',
    departmentId: DEPARTMENTS[0].id,
  },
};
const DEMO_PASSWORD = 'Demo@2024';
const DEMO_ADMIN_PASSWORD = 'Admin@2024';
const DEMO_STORAGE_KEY = 'suroj_demo_user';
const DEMO_EMPLOYEE_PROFILES_KEY = 'suroj_demo_employee_profiles_v1';

function saveDemoUser(u: AuthUser) { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(u)); }
function saveDemoEmployeeProfile(user: AuthUser) {
  if (user.role !== 'employee') return;
  try {
    const profiles = JSON.parse(localStorage.getItem(DEMO_EMPLOYEE_PROFILES_KEY) ?? '[]') as Array<{ id: string }>;
    const profile = {
      id: user.id,
      name: user.name ?? 'Suroj Employee',
      email: user.email,
      employeeId: user.employeeId ?? 'SRJ-DEMO',
      departmentId: user.departmentId ?? DEPARTMENTS[0].id,
      role: 'Employee',
      status: 'active',
      postScore: null,
      postSubmittedAt: null,
      postTimeTaken: null,
      trainerMarks: null,
      finalScore: null,
    };
    localStorage.setItem(DEMO_EMPLOYEE_PROFILES_KEY, JSON.stringify([
      ...profiles.filter((item) => item.id !== user.id),
      profile,
    ]));
  } catch {
    localStorage.setItem(DEMO_EMPLOYEE_PROFILES_KEY, JSON.stringify([]));
  }
}
function loadDemoUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) ?? 'null'); } catch { return null; }
}
function clearDemoUser() { localStorage.removeItem(DEMO_STORAGE_KEY); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadDemoUser());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try Supabase first; fall back silently for demo
  useEffect(() => {
    const demoUser = loadDemoUser();
    if (demoUser) {
      setUser(demoUser);
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const authUser = await buildAuthUser(s.user.id, s.user.email ?? '', s.user.app_metadata);
        setUser(authUser);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user) {
        const authUser = await buildAuthUser(s.user.id, s.user.email ?? '', s.user.app_metadata);
        setUser(authUser);
      } else if (!loadDemoUser()) {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const buildAuthUser = async (id: string, email: string, appMeta: Record<string, unknown>): Promise<AuthUser> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, employees(id, employee_id, name, department_id)')
        .eq('user_id', id)
        .single();

      if (profile) {
        const emp = profile.employees as { id: string; employee_id: string; name: string; department_id: string } | null;
        let departmentName: string | undefined;
        let departmentCode: string | undefined;
        if (emp?.department_id) {
          const { data: department } = await supabase
            .from('departments')
            .select('name, code')
            .eq('id', emp.department_id)
            .maybeSingle();
          departmentName = department?.name;
          departmentCode = department?.code;
        }
        return {
          id, email,
          role: profile.role as UserRole,
          employeeId: emp?.employee_id,
          employeeDbId: emp?.id,
          name: emp?.name ?? email,
          departmentId: emp?.department_id,
          departmentName,
          departmentCode,
        };
      }
    } catch { /* no profile table yet */ }
    const role = (appMeta?.role as UserRole) ?? 'employee';
    return { id, email, role, name: email };
  };

  const refreshUser = async () => {
    const { data: { user: su } } = await supabase.auth.getUser();
    if (su) {
      const authUser = await buildAuthUser(su.id, su.email ?? '', su.app_metadata);
      setUser(authUser);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const lower = email.toLowerCase().trim();

    // ── Demo path ──────────────────────────────────────────
    const isAdminEmail = lower === 'admin@surojbuildcon.com';
    const correctPwd = isAdminEmail ? DEMO_ADMIN_PASSWORD : DEMO_PASSWORD;

    if (password === correctPwd) {
      let demoUser = DEMO_USERS[lower];
      if (!demoUser && lower.endsWith('@surojbuildcon.com')) {
        // Any company email → demo employee
        const nameParts = lower.split('@')[0].replace(/[._]/g, ' ').split(' ');
        const name = nameParts.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        demoUser = {
          ...DEMO_USERS._fallbackEmployee,
          id: `demo-${Date.now()}`,
          email: lower,
          name,
        };
      }
      if (demoUser) {
        const u = { ...demoUser, email: lower };
        saveDemoUser(u);
        saveDemoEmployeeProfile(u);
        setUser(u);
        return { error: null };
      }
    }

    // ── Real Supabase path ─────────────────────────────────
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: 'Unable to connect. Use demo credentials: Demo@2024 / Admin@2024' };
    }
  };

  const signOut = async () => {
    clearDemoUser();
    setUser(null);
    setSession(null);
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{
      user, session, isLoading,
      isAdmin: user?.role === 'admin',
      isEmployee: user?.role === 'employee',
      signIn, signOut, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
