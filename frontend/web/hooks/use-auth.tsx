"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  signin as apiSignin,
  signup as apiSignup,
  logout as apiLogout,
  getMe,
  getCurrentUser,
  getStoredUser,
  sendCode as apiSendCode,
  verifyCode as apiVerifyCode,
  completeSignup as apiCompleteSignup,
  type User,
} from "@/lib/auth-service";
import { getRefreshToken, clearTokens, setTokens } from "@/lib/api-client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    organizationName: string,
    organizationSlug: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  sendCode: (email: string) => Promise<{ user_exists: boolean; name_hint: string }>;
  verifyCode: (
    email: string,
    code: string
  ) => Promise<{ action: "signin" | "signup"; temp_token?: string }>;
  completeSignup: (
    token: string,
    name: string,
    password: string,
    organizationName: string,
    organizationSlug: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) {
      setUser(stored);
      getMe()
        .then(setUser)
        .catch(() => {
          clearTokens();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signin = useCallback(
    async (email: string, password: string) => {
      const data = await apiSignin(email, password);
      setUser(data.user);
      router.push("/dashboard/inbox");
    },
    [router]
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      organizationName: string,
      organizationSlug: string
    ) => {
      const data = await apiSignup(email, password, name, organizationName, organizationSlug);
      setUser(data.user);
      router.push("/dashboard/inbox");
    },
    [router]
  );

  const sendCode = useCallback(async (email: string) => {
    const res = await apiSendCode(email);
    return { user_exists: res.user_exists, name_hint: res.name_hint };
  }, []);

  const verifyCode = useCallback(
    async (email: string, code: string) => {
      const res = await apiVerifyCode(email, code);
      return {
        action: res.action,
        temp_token: "temp_token" in res ? res.temp_token : undefined,
      };
    },
    []
  );

  const completeSignup = useCallback(
    async (
      token: string,
      name: string,
      password: string,
      organizationName: string,
      organizationSlug: string
    ) => {
      const data = await apiCompleteSignup(token, name, password, organizationName, organizationSlug);
      setUser(data.user);
      if (data.needs_workspace) {
        router.push("/dashboard/workspace-setup");
      } else {
        router.push("/dashboard/inbox");
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    await apiLogout(refresh);
    setUser(null);
    router.push("/signin");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, logout, sendCode, verifyCode, completeSignup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
