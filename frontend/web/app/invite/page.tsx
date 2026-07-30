"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import { signin as apiSignin } from "@/lib/auth-service";
import { setTokens } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface InvitationInfo {
  email: string;
  role: string;
  organization_name: string;
  invited_by: string | null;
  user_exists: boolean;
  user_is_active: boolean;
}

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token found");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/invitations/info?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invalid or expired invitation");
        return res.json();
      })
      .then((data) => {
        setInfo(data as InvitationInfo);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Invalid or expired invitation");
        setLoading(false);
      });
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name || info?.email?.split("@")[0] || "",
          password: password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed to accept invitation" }));
        throw new Error(err.detail || "Failed to accept invitation");
      }

      const data = await res.json();

      setTokens(data.access, data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard/inbox";
    } catch (e: any) {
      setError(e.message || "Failed to accept invitation");
      setSubmitting(false);
    }
  };

  const handleSignIn = async () => {
    if (!info?.email || !password) return;
    setSubmitting(true);
    setError("");

    try {
      await apiSignin(info.email, password);

      const res = await fetch(`${API_URL}/api/invitations/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed to accept invitation" }));
        throw new Error(err.detail || "Failed to accept invitation");
      }

      const data = await res.json();
      setTokens(data.access, data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard/inbox";
    } catch (e: any) {
      setError(e.message || "Invalid credentials");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <X className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-ink">Invalid Invitation</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/signin")}
            className="mt-6 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-sm font-bold text-primary-foreground">
            C
          </div>
          <h1 className="text-lg font-semibold text-ink">Join {info?.organization_name}</h1>
          {info?.invited_by && (
            <p className="mt-1 text-sm text-muted-foreground">
              <strong>{info.invited_by}</strong> invited you as an{" "}
              <strong>{info.role}</strong>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={info?.email || ""}
              disabled
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink opacity-60"
            />
          </div>

          {info?.user_exists && info?.user_is_active ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                />
              </div>
              <button
                onClick={handleSignIn}
                disabled={submitting || !password}
                className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Sign In & Join"
                )}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Create Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === "Enter" && handleAccept()}
                />
              </div>
              <button
                onClick={handleAccept}
                disabled={submitting || !password}
                className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Create Account & Join"
                )}
              </button>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <span className="font-medium text-ink">Connect</span>
        </p>
      </div>
    </div>
  );
}
