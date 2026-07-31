"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Save, Check, Loader2, Copy, CheckCheck, Paintbrush, Code, RefreshCw } from "lucide-react";
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
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
  const [iframeKey, setIframeKey] = useState(0);

  const orgId = user?.organization?.id || "";
  const [widgetUrl, setWidgetUrl] = useState("");

  useEffect(() => {
    if (orgId) {
      setWidgetUrl(`http://localhost:3001?organizationId=${orgId}&mode=preview`);
    }
  }, [orgId]);

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

  const pushConfig = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      {
        type: "connect:config-update",
        payload: {
          position: widget.position,
          borderRadius: widget.borderRadius,
          autoGreet: widget.autoGreet,
          autoGreetDelay: widget.autoGreetDelay,
          collectEmail: widget.collectEmail,
          showBranding: widget.showBranding,
          helpCenterEnabled: widget.helpCenterEnabled,
        },
      },
      "*",
    );
  }, [widget]);

  useEffect(() => {
    const timer = setTimeout(pushConfig, 300);
    return () => clearTimeout(timer);
  }, [iframeKey, pushConfig]);

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
      setIframeKey((k) => k + 1);
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
    <div className="flex flex-1 overflow-hidden">
      {/* Left Column — Settings */}
      <div className="flex w-1/2 flex-col border-r border-border overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Widget Appearance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Customize how the widget looks and behaves</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-4">
          {/* Position */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Position</label>
            <div className="mt-2 flex gap-2">
              {(["bottom-right", "bottom-left"] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setWidget({ ...widget, position: pos })}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    widget.position === pos
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {pos === "bottom-right" ? "Bottom Right" : "Bottom Left"}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Corner Roundness</label>
              <span className="text-xs tabular-nums text-muted-foreground">{widget.borderRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              value={widget.borderRadius}
              onChange={(e) => setWidget({ ...widget, borderRadius: Number(e.target.value) })}
              className="mt-2 w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Square</span>
              <span>Round</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">Behavior</p>
            {([
              { key: "autoGreet" as const, label: "Auto Greet Visitors", desc: "Show a greeting message after a delay" },
              { key: "collectEmail" as const, label: "Collect Email", desc: "Require name and email before chatting" },
              { key: "showBranding" as const, label: "Show Branding", desc: "Display \"Powered by Connect\" in footer" },
              { key: "helpCenterEnabled" as const, label: "Enable Help Center", desc: "Show knowledge base articles in widget" },
            ]).map(({ key, label, desc }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3.5 py-3 transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0">
                  <span className="block text-sm text-ink">{label}</span>
                  <span className="block text-[11px] text-muted-foreground">{desc}</span>
                </div>
                <div className="ml-3 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={widget[key]}
                    onClick={() => setWidget({ ...widget, [key]: !widget[key] })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      widget[key] ? "bg-accent" : "bg-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                        widget[key] ? "translate-x-[17px]" : "translate-x-[3px]"
                      }`}
                    />
                  </button>
                </div>
              </label>
            ))}
          </div>

          {/* Auto Greet Delay */}
          {widget.autoGreet && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Greet Delay</label>
                <span className="text-xs tabular-nums text-muted-foreground">{widget.autoGreetDelay}s</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={widget.autoGreetDelay}
                onChange={(e) => setWidget({ ...widget, autoGreetDelay: Number(e.target.value) })}
                className="mt-2 w-full accent-accent"
              />
            </div>
          )}
        </div>

        {/* Save Bar */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {msg && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <Check className="h-3.5 w-3.5" /> {msg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column — Live Preview */}
      <div className="flex w-1/2 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {widgetUrl ? (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={widgetUrl}
              className="h-full w-full border-0 bg-white"
              title="Widget Preview"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Loading workspace...</span>
            </div>
          )}
        </div>
      </div>
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
