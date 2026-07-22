import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { AuthShell } from "@/app/landing/components/auth-shell";

export default function SignUpPage() {
  const perks = [
    "14-day trial, no card required",
    "AI copilot in 90+ languages",
    "Unlimited seats during trial",
  ];

  return (
    <AuthShell
      title="Start supporting the world."
      subtitle="Spin up a workspace, connect a channel, and let the AI copilot handle the rest."
      footer={
        <div>
          By continuing you agree to Connect&apos;s <a href="#">Terms</a> and{" "}
          <a href="#">Privacy Policy</a>.
        </div>
      }
    >
      <ul className="mb-8 space-y-2">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-accent-foreground" strokeWidth={3} />
            {p}
          </li>
        ))}
      </ul>

      <form className="space-y-4">
        <Field label="Your name" placeholder="Ava Martinez" required />
        <Field label="Work email" type="email" placeholder="you@company.com" required />
        <Field label="Password" type="password" placeholder="At least 8 characters" required />

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-medium text-primary-foreground transition hover:bg-ink/90"
        >
          Create workspace <ArrowRight className="h-4 w-4" />
        </button>

        <div className="pt-2 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="text-ink underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </form>
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
