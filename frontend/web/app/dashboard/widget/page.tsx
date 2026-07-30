"use client";

import { useState, useEffect } from "react";
import { Save, Check, Loader2, Copy, CheckCheck, Paintbrush, Code } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

type Tab = "appearance" | "install";

export default function WidgetPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("appearance");

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 flex-col overflow-hidden bg-card shadow-sm">
        <div className="flex items-center gap-6 border-b border-border px-5">
          <button
            onClick={() => setTab("appearance")}
            className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              tab === "appearance"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Paintbrush className="h-4 w-4" />
            Appearance
          </button>
          <button
            onClick={() => setTab("install")}
            className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              tab === "install"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="h-4 w-4" />
            Install
          </button>
        </div>

        {tab === "appearance" && <AppearanceTab />}
        {tab === "install" && <InstallTab />}
      </div>
    </div>
  );
}

function AppearanceTab() {
  const [widget, setWidget] = useState({
    position: "bottom-right" as "bottom-right" | "bottom-left",
    borderRadius: 16,
    autoGreet: true,
    autoGreetDelay: 3,
    collectEmail: true,
    showBranding: true,
    helpCenterEnabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/api/workspace/widget-config").catch(() => null).then((w) => {
      if (w) {
        setWidget({
          position: w.position || "bottom-right",
          borderRadius: w.border_radius ?? 16,
          autoGreet: w.auto_greet ?? true,
          autoGreetDelay: w.auto_greet_delay ?? 3,
          collectEmail: w.collect_email ?? true,
          showBranding: w.show_branding ?? true,
          helpCenterEnabled: w.help_center_enabled ?? true,
        });
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      await api.patch("/api/workspace/widget-config", {
        position: widget.position,
        border_radius: widget.borderRadius,
        auto_greet: widget.autoGreet,
        auto_greet_delay: widget.autoGreetDelay,
        collect_email: widget.collectEmail,
        show_branding: widget.showBranding,
        help_center_enabled: widget.helpCenterEnabled,
      });
      setMsg("Saved");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Widget Appearance</h2>
          <p className="text-xs text-muted-foreground mt-1">Customize how the widget looks and behaves</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </button>
          {msg && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" /> {msg}
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Position</label>
        <div className="mt-1 flex gap-2">
          <button
            onClick={() => setWidget({ ...widget, position: "bottom-right" })}
            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
              widget.position === "bottom-right"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Bottom Right
          </button>
          <button
            onClick={() => setWidget({ ...widget, position: "bottom-left" })}
            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
              widget.position === "bottom-left"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Bottom Left
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Border Radius ({widget.borderRadius}px)</label>
        <input
          type="range"
          min={0}
          max={24}
          value={widget.borderRadius}
          onChange={(e) => setWidget({ ...widget, borderRadius: Number(e.target.value) })}
          className="mt-1 w-full max-w-xs"
        />
      </div>

      <div className="space-y-3">
        {([
          { key: "autoGreet" as const, label: "Auto Greet Visitors" },
          { key: "collectEmail" as const, label: "Collect Email" },
          { key: "showBranding" as const, label: "Show Branding" },
          { key: "helpCenterEnabled" as const, label: "Enable Help Center" },
        ]).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={widget[key]}
              onChange={() => setWidget({ ...widget, [key]: !widget[key] })}
              className="h-4 w-4 rounded border-border text-accent"
            />
            <span className="text-sm text-ink">{label}</span>
          </label>
        ))}
      </div>

      {widget.autoGreet && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Auto Greet Delay ({widget.autoGreetDelay}s)</label>
          <input
            type="range"
            min={1}
            max={15}
            value={widget.autoGreetDelay}
            onChange={(e) => setWidget({ ...widget, autoGreetDelay: Number(e.target.value) })}
            className="mt-1 w-full max-w-xs"
          />
        </div>
      )}
    </div>
  );
}

function InstallTab() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState("https://your-domain.com");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const orgId = user?.organization?.id || "";

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-ink">Install Widget</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Copy the embed snippet below to add the chat widget to your website.
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Workspace ID</label>
        <div className="mt-1 flex max-w-md items-center gap-2">
          <input
            type="text"
            readOnly
            value={orgId}
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono text-ink outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(orgId);
              setCopiedId(true);
              setTimeout(() => setCopiedId(false), 2000);
            }}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {copiedId ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedId ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Embed Code</label>
        <pre className="mt-1 max-w-xl overflow-x-auto rounded-md border border-border bg-surface p-3 text-xs font-mono text-ink leading-relaxed">
{`<iframe
  src="${origin}/widget?organizationId=${orgId}"
  style="position:fixed;bottom:20px;right:20px;width:380px;height:600px;border:none;z-index:9999"
  title="Connect Widget"
/>`}
        </pre>
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `<iframe\n  src="${origin}/widget?organizationId=${orgId}"\n  style="position:fixed;bottom:20px;right:20px;width:380px;height:600px;border:none;z-index:9999"\n  title="Connect Widget"\n/>`
            );
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
          }}
          className="mt-2 flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {copiedCode ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedCode ? "Copied" : "Copy Code"}
        </button>
      </div>
    </div>
  );
}
