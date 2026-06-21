import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export type Role = "aluno" | "professor" | "admin" | "tester";

export type TeacherStatus = "none" | "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  roles: Role[];
  activeRole: Role;
  plan: "free" | "premium";
  englishLevel: string | null;
  nativeLanguage: string | null;
  teacherStatus: TeacherStatus;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ACTIVE_ROLE_KEY = "lunari.activeRole";

function readActiveRole(): Role | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(ACTIVE_ROLE_KEY);
  return v === "aluno" || v === "professor" || v === "admin" ? v : null;
}
function writeActiveRole(role: Role | null) {
  if (typeof window === "undefined") return;
  if (role) localStorage.setItem(ACTIVE_ROLE_KEY, role);
  else localStorage.removeItem(ACTIVE_ROLE_KEY);
}

async function hydrateUser(su: SupabaseUser): Promise<User> {
  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", su.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", su.id),
  ]);
  const roles: Role[] = (roleRows ?? []).map((r) => r.role as Role);
  if (roles.length === 0) roles.push("aluno");
  const stored = readActiveRole();
  const activeRole: Role = stored && roles.includes(stored) ? stored : roles[0]!;
  const meta = (su.user_metadata ?? {}) as Record<string, unknown>;
  const p = (profile ?? {}) as Record<string, unknown>;
  const teacherStatus = (p.teacher_status as TeacherStatus | undefined) ?? "none";
  return {
    id: su.id,
    email: su.email ?? "",
    name:
      profile?.display_name ??
      (typeof meta.display_name === "string" ? meta.display_name : undefined) ??
      (typeof meta.full_name === "string" ? meta.full_name : undefined) ??
      (su.email?.split("@")[0] ?? "Aluno"),
    avatarUrl: profile?.avatar_url ?? (typeof meta.avatar_url === "string" ? meta.avatar_url : null),
    roles,
    activeRole,
    plan: (profile?.plan as "free" | "premium") ?? "free",
    englishLevel: (profile?.english_level as string | null) ?? null,
    nativeLanguage: (profile?.native_language as string | null) ?? null,
    teacherStatus,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function applySession(session: Session | null) {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await hydrateUser(session.user);
      setUser(u);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    // 1. listener first (must)
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        setUser(null);
        writeActiveRole(null);
        return;
      }
      if (session?.user) {
        // defer to avoid deadlock
        setTimeout(() => applySession(session), 0);
      }
    });
    // 2. then check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) applySession(data.session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Falha ao entrar");
      const u = await hydrateUser(data.user);
      setUser(u);
      return u;
    },
    loginWithGoogle: async () => {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      // If redirected, browser navigates away; if tokens returned, listener will hydrate.
    },
    signup: async (name, email, password, role) => {
      const safeRole = role === "admin" ? "aluno" : role;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: name, role: safeRole },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Falha ao criar conta");
      writeActiveRole(safeRole);
      // Profile/role rows are created by the on_auth_user_created trigger.
      // Wait a tick for the trigger to commit, then hydrate.
      await new Promise((r) => setTimeout(r, 350));
      const u = await hydrateUser(data.user);
      // Não autentica até o e-mail ser confirmado (fluxo OTP em /verify).
      if (data.session) setUser(u);
      return u;
    },
    logout: async () => {
      await supabase.auth.signOut();
      writeActiveRole(null);
      setUser(null);
    },
    switchRole: (role) => {
      setUser((prev) => {
        if (!prev) return prev;
        if (!prev.roles.includes(role)) return prev;
        writeActiveRole(role);
        return { ...prev, activeRole: role };
      });
    },
    refresh: async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const u = await hydrateUser(data.session.user);
        setUser(u);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}