"use client";

import { useState } from "react";
import {
  Save,
  Building2,
  Palette,
  MessageSquare,
  Bell,
  CreditCard,
  Check,
  X,
  Upload,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

type Tab = "general" | "branding" | "widget" | "notifications" | "billing" | "appearance";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);

  const [workspace, setWorkspace] = useState({
    name: "Syft Technologies",
    slug: "syft-connect",
    timezone: "UTC",
  });

  const [branding, setBranding] = useState({
    primaryColor: "#2563eb",
    companyName: "Connect",
    logoUrl: "",
  });

  const [widget, setWidget] = useState({
    position: "bottom-right" as "bottom-right" | "bottom-left",
    borderRadius: 16,
    autoGreet: true,
    autoGreetDelay: 3,
    collectEmail: true,
    showBranding: true,
    helpCenterEnabled: true,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newConversationAlert: true,
    messageFromVisitor: true,
    weeklyDigest: false,
    mentionAlert: true,
  });

  const plan = {
    name: "Pro",
    price: "$29",
    interval: "month",
    seats: 10,
    usedSeats: 3,
    features: [
      "Unlimited conversations",
      "AI-powered responses",
      "Help center & knowledge base",
      "Team collaboration",
      "Custom branding",
    ],
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: "general", label: "General", icon: Building2 },
    { key: "branding", label: "Branding", icon: Palette },
    { key: "widget", label: "Widget", icon: MessageSquare },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "appearance", label: "Appearance", icon: Sun },
    { key: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="flex h-full flex-col p-0 md:pl-3 md:pt-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-none md:rounded-tl-lg bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h1 className="text-sm font-semibold text-ink">Settings</h1>
          <button
            onClick={save}
            className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-xs text-primary-foreground hover:opacity-90"
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="flex flex-1 gap-0 overflow-hidden">
          <div className="flex md:w-48 shrink-0 overflow-x-auto border-b md:border-b-0 md:flex-col md:border-r border-border p-2 gap-1 md:gap-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                  tab === t.key
                    ? "bg-surface-2 text-ink font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <t.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            {tab === "general" && (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Workspace</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Manage your workspace settings</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Company Name</label>
                    <input
                      type="text"
                      value={workspace.name}
                      onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                      className="mt-1 w-full max-w-md rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Workspace Slug</label>
                    <div className="mt-1 flex max-w-md items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
                      <span>app.connect.com/</span>
                      <input
                        type="text"
                        value={workspace.slug}
                        onChange={(e) => setWorkspace({ ...workspace, slug: e.target.value })}
                        className="flex-1 bg-transparent text-ink outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Timezone</label>
                    <select
                      value={workspace.timezone}
                      onChange={(e) => setWorkspace({ ...workspace, timezone: e.target.value })}
                      className="mt-1 w-full max-w-md rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="US/Eastern">US/Eastern</option>
                      <option value="US/Pacific">US/Pacific</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {tab === "branding" && (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Branding</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Customize your brand appearance</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Primary Color</label>
                    <div className="mt-1 flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-md border border-border"
                        style={{ backgroundColor: branding.primaryColor }}
                      />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none w-28 font-mono"
                      />
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="h-8 w-8 cursor-pointer rounded border border-border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Company Name</label>
                    <input
                      type="text"
                      value={branding.companyName}
                      onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                      className="mt-1 w-full max-w-md rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Logo URL</label>
                    <div className="mt-1 flex max-w-md items-center gap-2">
                      <input
                        type="text"
                        value={branding.logoUrl}
                        onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink outline-none placeholder:text-muted-foreground"
                      />
                      <button className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                        <Upload className="h-3 w-3" />
                        Upload
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Preview</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {branding.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{branding.companyName}</p>
                      <p className="text-[10px] text-muted-foreground">Customer Support</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "widget" && (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Chat Widget</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Configure the widget behavior</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground">Position</label>
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => setWidget({ ...widget, position: "bottom-right" })}
                        className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                          widget.position === "bottom-right"
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Bottom Right
                      </button>
                      <button
                        onClick={() => setWidget({ ...widget, position: "bottom-left" })}
                        className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
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
                    <label className="text-[10px] font-medium text-muted-foreground">Border Radius ({widget.borderRadius}px)</label>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      value={widget.borderRadius}
                      onChange={(e) => setWidget({ ...widget, borderRadius: Number(e.target.value) })}
                      className="mt-1 w-full max-w-xs"
                    />
                  </div>
                  <div className="space-y-2.5">
                    {([
                      { key: "autoGreet", label: "Auto Greet Visitors" },
                      { key: "collectEmail", label: "Collect Email" },
                      { key: "showBranding", label: "Show Branding" },
                      { key: "helpCenterEnabled", label: "Enable Help Center" },
                    ] as const).map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={widget[key]}
                          onChange={() => setWidget({ ...widget, [key]: !widget[key] })}
                          className="h-3.5 w-3.5 rounded border-border text-accent"
                        />
                        <span className="text-xs text-ink">{label}</span>
                      </label>
                    ))}
                  </div>
                  {widget.autoGreet && (
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground">Auto Greet Delay ({widget.autoGreetDelay}s)</label>
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
              </div>
            )}

            {tab === "notifications" && (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Notifications</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Manage how you receive alerts</p>
                </div>

                <div className="space-y-3">
                  {([
                    { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
                    { key: "newConversationAlert", label: "New Conversation", desc: "When a new conversation starts" },
                    { key: "messageFromVisitor", label: "Visitor Messages", desc: "When a visitor sends a message" },
                    { key: "mentionAlert", label: "Mentions", desc: "When you are mentioned in a conversation" },
                    { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary of activity" },
                  ] as const).map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 cursor-pointer hover:bg-surface-2 transition-colors">
                      <div>
                        <p className="text-xs font-medium text-ink">{label}</p>
                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                      </div>
                      <div
                        onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                        className={`relative h-5 w-9 rounded-full transition-colors ${
                          notifications[key] ? "bg-accent" : "bg-border"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                            notifications[key] ? "translate-x-4.5 left-0.5" : "left-0.5"
                          }`}
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {tab === "appearance" && (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Appearance</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Choose your theme preference</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { value: "light" as const, label: "Light", icon: Sun, desc: "Always light mode" },
                    { value: "dark" as const, label: "Dark", icon: Moon, desc: "Always dark mode" },
                    { value: "system" as const, label: "System", icon: Monitor, desc: "Follow system preference" },
                  ]).map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                        theme === value
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-muted-foreground/30 bg-surface"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                          theme === value ? "bg-accent text-white" : "bg-surface-2 text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-semibold ${theme === value ? "text-accent" : "text-ink"}`}>
                          {label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      {theme === value && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Preview</p>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[10px] font-bold text-white">
                      C
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-2 w-28 rounded bg-ink/20" />
                      <div className="h-2 w-20 rounded bg-muted-foreground/20" />
                    </div>
                    <div className="h-6 w-12 rounded-md bg-surface-2" />
                  </div>
                </div>
              </div>
            )}

            {tab === "billing" && (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Billing & Plan</h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Manage your subscription</p>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current Plan</p>
                      <p className="mt-1 text-2xl font-bold text-ink">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.price}/{plan.interval} &middot; {plan.usedSeats}/{plan.seats} seats used
                      </p>
                    </div>
                    <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Change Plan
                    </button>
                  </div>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-border">
                    <div
                      className="h-1.5 rounded-full bg-accent transition-all"
                      style={{ width: `${(plan.usedSeats / plan.seats) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Plan Features</p>
                  <div className="space-y-1.5">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                        <Check className="h-3 w-3 text-green-500 shrink-0" />
                        <span className="text-xs text-ink">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-ink">Next billing date</p>
                        <p className="text-[10px] text-muted-foreground">August 21, 2026</p>
                      </div>
                    </div>
                    <button className="text-[10px] text-accent hover:underline">View Invoices</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
