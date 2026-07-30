"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Building2,
  Palette,
  Bell,
  CreditCard,
  Check,
  Upload,
  User,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";

type Tab = "account" | "general" | "branding" | "notifications" | "billing";

export default function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);

  const [accountName, setAccountName] = useState(user?.name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountMsg, setAccountMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [workspace, setWorkspace] = useState({
    name: "",
    slug: "",
    timezone: "UTC",
  });
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [workspaceMsg, setWorkspaceMsg] = useState("");

  const [branding, setBranding] = useState({
    primaryColor: "#2563eb",
    companyName: "Connect",
    logoUrl: "",
  });
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [brandingMsg, setBrandingMsg] = useState("");

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newConversationAlert: true,
    messageFromVisitor: true,
    weeklyDigest: false,
    mentionAlert: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    setAccountName(user?.name || "");
    setWorkspace({
      name: user?.organization?.name || "",
      slug: user?.organization?.slug || "",
      timezone: user?.organization?.timezone || "UTC",
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<any>("/api/workspace/branding").catch(() => null),
      api.get<any>("/api/workspace/notifications").catch(() => null),
    ]).then(([b, n]) => {
      if (b) {
        setBranding({
          primaryColor: b.primary_color || "#2563eb",
          companyName: b.company_name || "Connect",
          logoUrl: b.logo_url || "",
        });
      }
      if (n) {
        setNotifications({
          emailNotifications: n.email_notifications ?? true,
          newConversationAlert: n.new_conversation_alert ?? true,
          messageFromVisitor: n.message_from_visitor ?? true,
          weeklyDigest: n.weekly_digest ?? false,
          mentionAlert: n.mention_alert ?? true,
        });
      }
      setLoading(false);
    });
  }, [user]);

  const saveWorkspace = async () => {
    setWorkspaceSaving(true);
    setWorkspaceMsg("");
    try {
      await api.patch("/api/workspace", {
        name: workspace.name,
        slug: workspace.slug,
        timezone: workspace.timezone,
      });
      setWorkspaceMsg("Saved");
      setTimeout(() => setWorkspaceMsg(""), 2000);
    } catch {
      setWorkspaceMsg("Failed to save");
    } finally {
      setWorkspaceSaving(false);
    }
  };

  const saveBranding = async () => {
    setBrandingSaving(true);
    setBrandingMsg("");
    try {
      await api.patch("/api/workspace/branding", {
        primary_color: branding.primaryColor,
        company_name: branding.companyName,
        logo_url: branding.logoUrl,
      });
      setBrandingMsg("Saved");
      setTimeout(() => setBrandingMsg(""), 2000);
    } catch {
      setBrandingMsg("Failed to save");
    } finally {
      setBrandingSaving(false);
    }
  };

  const saveNotifications = async () => {
    setNotifSaving(true);
    setNotifMsg("");
    try {
      await api.patch("/api/workspace/notifications", {
        email_notifications: notifications.emailNotifications,
        new_conversation_alert: notifications.newConversationAlert,
        message_from_visitor: notifications.messageFromVisitor,
        weekly_digest: notifications.weeklyDigest,
        mention_alert: notifications.mentionAlert,
      });
      setNotifMsg("Saved");
      setTimeout(() => setNotifMsg(""), 2000);
    } catch {
      setNotifMsg("Failed to save");
    } finally {
      setNotifSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: "account", label: "Account", icon: User },
    { key: "general", label: "General", icon: Building2 },
    { key: "branding", label: "Branding", icon: Palette },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "billing", label: "Billing", icon: CreditCard },
  ];

  const SaveButton = ({
    saving,
    msg,
    onClick,
  }: {
    saving: boolean;
    msg: string;
    onClick: () => void;
  }) => (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Saving..." : "Save"}
      </button>
      {msg && (
        <span className="flex items-center gap-1 text-xs text-emerald-600">
          <Check className="h-3.5 w-3.5" /> {msg}
        </span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center md:pl-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 flex-col overflow-hidden bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h1 className="text-base font-semibold text-ink">Settings</h1>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Workspace</h2>
                    <p className="text-xs text-muted-foreground mt-1">Manage your workspace settings</p>
                  </div>
                  <SaveButton saving={workspaceSaving} msg={workspaceMsg} onClick={saveWorkspace} />
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Branding</h2>
                    <p className="text-xs text-muted-foreground mt-1">Customize your brand appearance</p>
                  </div>
                  <SaveButton saving={brandingSaving} msg={brandingMsg} onClick={saveBranding} />
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

            {tab === "notifications" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Notifications</h2>
                    <p className="text-xs text-muted-foreground mt-1">Manage how you receive alerts</p>
                  </div>
                  <SaveButton saving={notifSaving} msg={notifMsg} onClick={saveNotifications} />
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
