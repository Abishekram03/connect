"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { setupWorkspace } from "@/lib/auth-service";
import { ApiError } from "@/lib/api-client";

export default function WorkspaceSetupPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await setupWorkspace(orgName, slug);
      localStorage.setItem("user", JSON.stringify(res.user));
      router.push("/dashboard/inbox");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-sm font-bold text-primary-foreground">
            C
          </div>
          <h1 className="text-lg font-semibold text-ink">Name your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Almost there — just one last step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface px-4 py-2 text-xs text-muted-foreground">
            {user?.email}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Company name</span>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Inc."
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted-foreground focus:border-ink"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-medium text-primary-foreground transition hover:bg-ink/90 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create workspace <ArrowRight className="h-4 w-4" />
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={logout}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
