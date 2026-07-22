"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/app/landing/components/auth-shell";

export default function SignInPage() {
  const router = useRouter();

  const handleDemo = () => {
    router.push("/dashboard/inbox");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard/inbox");
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Pick up where your team left off — inbox, macros, and AI copilot."
      footer={
        <div className="flex items-center justify-between">
          <span>© {new Date().getFullYear()} Connect Labs</span>
          <div className="flex gap-4">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      }
    >
      <button
        onClick={handleDemo}
        className="mb-6 flex w-full items-center justify-between rounded-2xl border border-accent/50 bg-accent/10 px-5 py-4 text-left transition hover:bg-accent/20"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-medium text-ink">Try the demo workspace</div>
            <div className="text-xs text-muted-foreground">
              Instantly explore — no signup required
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-ink" />
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Work email" type="email" placeholder="you@company.com" required />
        <Field label="Password" type="password" placeholder="••••••••" required />

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-medium text-primary-foreground transition hover:bg-ink/90"
        >
          Sign in <ArrowRight className="h-4 w-4" />
        </button>

        <div className="pt-2 text-center text-sm text-muted-foreground">
          New to Connect?{" "}
          <Link href="/signup" className="text-ink underline underline-offset-4">
            Create an account
          </Link>
        </div>
      </form>

      <div className="mt-6 rounded-lg border border-dashed border-border bg-surface p-3 text-xs text-muted-foreground">
        <span className="font-mono text-ink">demo@connect.app</span> /{" "}
        <span className="font-mono text-ink">demo1234</span>
      </div>
    </AuthShell>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted-foreground focus:border-ink"
      />
    </label>
  );
}
