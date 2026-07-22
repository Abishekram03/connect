"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import {
  screenAtom,
  sessionTokenAtomFamily,
  organizationIdAtom,
} from "../../atoms/widget-atoms";

interface Props {
  mode?: "preview" | "production";
}

export const WidgetAuthScreen = ({ mode }: Props) => {
  const [orgId] = useAtom(organizationIdAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setSessionToken] = useAtom(
    sessionTokenAtomFamily(orgId || ""),
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setSessionToken("demo-token");
    setScreen("selection");
    setIsSubmitting(false);
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    setSessionToken("demo-token");
    setScreen("selection");
    setIsSubmitting(false);
  };

  return (
    <div className="flex h-full flex-col px-4 pt-5 pb-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Welcome!</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Enter your details to start chatting.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-70"
        >
          {isSubmitting ? "Starting..." : "Start Chat"}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSubmitting}
          className="text-xs underline hover:opacity-80 text-blue-600"
        >
          Continue as guest
        </button>
      </form>
      </div>
    </div>
  );
};
