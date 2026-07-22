/**
 * WidgetContactForm
 * ──────────────────
 * Collects guest name and email before starting a session.
 * GDPR-compliant: clearly states data usage.
 * Supports dynamic color customization.
 */

"use client";

import { useState } from "react";
import { Button } from "@connect/ui/components/button";

interface WidgetContactFormProps {
  onSubmit: (name: string, email: string) => Promise<void>;
  primaryColor?: string;
}

export function WidgetContactForm({
  onSubmit,
  primaryColor = "#2563eb",
}: WidgetContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldUseDarkText = (hexColor: string): boolean => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const textColor = shouldUseDarkText(primaryColor) ? "#000" : "#fff";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), email.trim());
    } catch {
      setError("Failed to start session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit("", "");
    } catch {
      setError("Failed to start session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Welcome!</h2>
        <p className="text-sm text-muted-foreground">
          Enter your details to start chatting with our support team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
            style={{
              outlineColor: primaryColor,
            }}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50"
            style={{
              outlineColor: primaryColor,
            }}
            disabled={isSubmitting}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <p className="text-[10px] text-muted-foreground">
          Your information is used solely to provide support. We respect your
          privacy and comply with GDPR.
        </p>

        <div className="mt-auto flex flex-col gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            style={{
              backgroundColor: primaryColor,
              color: textColor,
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                (e.currentTarget as HTMLButtonElement).style.filter =
                  "brightness(0.9)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter =
                "brightness(1)";
            }}
          >
            {isSubmitting ? "Starting..." : "Start Chat"}
          </Button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-xs underline hover:opacity-80"
            style={{ color: primaryColor }}
          >
            Continue as guest
          </button>
        </div>
      </form>
    </div>
  );
}
