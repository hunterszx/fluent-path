import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "aluno" | "professor" | "admin" | "tester";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  activeRole: Role;
  plan: "free" | "premium";
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<User>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "lunari.user";

const TESTER_EMAIL = "tester@lunari.dev";

function persist(u: User | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEY);
}

function load(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function buildUser(name: string, email: string, role: Role): User {
  if (email.toLowerCase() === TESTER_EMAIL) {
    return {
      id: "tester",
      name: "Tester Lunari",
      email: TESTER_EMAIL,
      roles: ["aluno", "professor", "admin", "tester"],
      activeRole: "aluno",
      plan: "premium",
    };
  }
  return {
    id: crypto.randomUUID(),
    name,
    email,
    roles: [role],
    activeRole: role,
    plan: "free",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(load());
  }, []);

  const value: AuthContextValue = {
    user,
    login: async (email) => {
      const u = buildUser(email.split("@")[0] ?? "Aluno", email, "aluno");
      persist(u);
      setUser(u);
      return u;
    },
    loginWithGoogle: async () => {
      const u = buildUser("Aluno Google", "google@lunari.app", "aluno");
      persist(u);
      setUser(u);
      return u;
    },
    signup: async (name, email, _password, role) => {
      const u = buildUser(name || email.split("@")[0] || "Usuário", email, role);
      persist(u);
      setUser(u);
      return u;
    },
    logout: () => {
      persist(null);
      setUser(null);
    },
    switchRole: (role) => {
      setUser((prev) => {
        if (!prev) return prev;
        if (!prev.roles.includes(role) && !prev.roles.includes("tester")) return prev;
        const next = { ...prev, activeRole: role };
        persist(next);
        return next;
      });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const TESTER_CREDENTIALS = {
  email: TESTER_EMAIL,
  password: "lunari-tester",
};