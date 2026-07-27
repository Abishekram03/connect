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
  Upload,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Tab = "account" | "general" | "branding" | "widget" | "notifications" | "billing";

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);

  const [accountName, setAccountName] = useState(user?.name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountMsg, setAccountMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [workspace, setWorkspace] = useState({
    name: user?.organization?.name || "",
    slug: user?.organization?.slug || "",
    timezone: user?.organization?.timezone || "UTC",
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

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: "account", label: "Account", icon: User },
    { key: "general", label: "General", icon: Building2 },
    { key: "branding", label: "Branding", icon: Palette },
    { key: "widget", label: "Widget", icon: MessageSquare },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 flex-col overflow-hidden bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h1 className="text-base font-semibold text-ink">Settings</h1>
          <button
            onClick={save}
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="flex flex-1 gap-0 overflow-hidden">
          <div className="flex md:w-56 shrink-0 overflow-x-auto border-b md:border-b-0 md:flex-col md:border-r border-border p-2 gap-1 md:gap-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  tab === t.key
                    ? "bg-surface-2 text-ink font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            {tab === "account" && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-ink">Account</h2>
                  <p className="text-xs text-muted-foreground mt-1">Manage your personal information</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <div className="flex max-w-md gap-2">
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={async () => {
                          try {
                            const { updateProfile } = await import("@/lib/auth-service");
                            await updateProfile(accountName);
                            setAccountMsg("Name updated");
                            setTimeout(() => setAccountMsg(""), 2000);
                          } catch {
                            setAccountMsg("Failed to update name");
                          }
                        }}
                        className="mt-1 shrink-0 rounded-md bg-ink px-4 py-2 text-sm text-primary-foreground"
                      >
                        Save
                      </button>
                    </div>
                    {accountMsg && (
                      <p className="mt-1 text-xs text-muted-foreground">{accountMsg}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <p className="mt-1 text-sm text-ink">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="border-t border-border pt-5">
                    <h3 className="text-sm font-semibold text-ink mb-4">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const { changePassword } = await import("@/lib/auth-service");
                            await changePassword(oldPassword, newPassword);
                            setPasswordMsg("Password updated");
                            setOldPassword("");
                            setNewPassword("");
                            setTimeout(() => setPasswordMsg(""), 2000);
                          } catch (err: any) {
                            setPasswordMsg(err.message || "Failed to update password");
                          }
                        }}
                        className="rounded-md bg-ink px-4 py-2 text-sm text-primary-foreground"
                      >
                        Update Password
                      </button>
                      {passwordMsg && (
                        <p className="text-xs text-muted-foreground">{passwordMsg}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "general" && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-ink">Workspace</h2>
                  <p className="text-xs text-muted-foreground mt-1">Manage your workspace settings</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                    <input
                      type="text"
                      value={workspace.name}
                      onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                      className="mt-1 w-full max-w-md rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Workspace Slug</label>
                    <div className="mt-1 flex max-w-md items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground">
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
                    <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                    <select
                      value={workspace.timezone}
                      onChange={(e) => setWorkspace({ ...workspace, timezone: e.target.value })}
                      className="mt-1 w-full max-w-md rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
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
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-ink">Branding</h2>
                  <p className="text-xs text-muted-foreground mt-1">Customize your brand appearance</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Primary Color</label>
                    <div className="mt-1 flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-md border border-border"
                        style={{ backgroundColor: branding.primaryColor }}
                      />
                      <input
                        type="text"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none w-32 font-mono"
                      />
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded border border-border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                    <input
                      type="text"
                      value={branding.companyName}
                      onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                      className="mt-1 w-full max-w-md rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Logo URL</label>
                    <div className="mt-1 flex max-w-md items-center gap-2">
                      <input
                        type="text"
                        value={branding.logoUrl}
                        onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                      />
                      <button className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                        <Upload className="h-4 w-4" />
                        Upload
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Preview</p>
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {branding.companyName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-ink">{branding.companyName}</p>
                      <p className="text-xs text-muted-foreground">Customer Support</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "widget" && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-ink">Chat Widget</h2>
                  <p className="text-xs text-muted-foreground mt-1">Configure the widget behavior</p>
                </div>

                <div className="space-y-5">
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
                      { key: "autoGreet", label: "Auto Greet Visitors" },
                      { key: "collectEmail", label: "Collect Email" },
                      { key: "showBranding", label: "Show Branding" },
                      { key: "helpCenterEnabled", label: "Enable Help Center" },
                    ] as const).map(({ key, label }) => (
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
              </div>
            )}

            {tab === "notifications" && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-ink">Notifications</h2>
                  <p className="text-xs text-muted-foreground mt-1">Manage how you receive alerts</p>
                </div>

                <div className="space-y-3">
                  {([
                    { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
                    { key: "newConversationAlert", label: "New Conversation", desc: "When a new conversation starts" },
                    { key: "messageFromVisitor", label: "Visitor Messages", desc: "When a visitor sends a message" },
                    { key: "mentionAlert", label: "Mentions", desc: "When you are mentioned in a conversation" },
                    { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary of activity" },
                  ] as const).map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center justify-between rounded-lg border border-border px-5 py-3.5 cursor-pointer hover:bg-surface-2 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-ink">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div
                        onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                        className={`relative h-6 w-10 rounded-full transition-colors ${
                          notifications[key] ? "bg-accent" : "bg-border"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            notifications[key] ? "translate-x-4.5 left-0.5" : "left-0.5"
                          }`}
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {tab === "billing" && (
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-ink">Billing & Plan</h2>
                  <p className="text-xs text-muted-foreground mt-1">Manage your subscription</p>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CreditCard className="h-14 w-14 text-border mb-4" />
                  <p className="text-base font-medium text-ink">No billing information yet</p>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                    Billing details will appear here once you set up your subscription.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
