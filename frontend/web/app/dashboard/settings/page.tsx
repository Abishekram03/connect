"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Building2,
  Bell,
  CreditCard,
  Check,
  User,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/toast";

type Tab = "account" | "general" | "notifications" | "billing";

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("account");

  const [accountName, setAccountName] = useState(user?.name || "");
  const [agentLanguage, setAgentLanguage] = useState(user?.language || "en");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [workspace, setWorkspace] = useState({
    name: "",
    slug: "",
    timezone: "UTC",
  });
  const [workspaceSaving, setWorkspaceSaving] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newConversationAlert: true,
    messageFromVisitor: true,
    weeklyDigest: false,
    mentionAlert: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      api.get<any>("/api/workspace/notifications").catch(() => null),
    ]).then(([n]) => {
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
    try {
      await api.patch("/api/workspace", {
        name: workspace.name,
        slug: workspace.slug,
        timezone: workspace.timezone,
      });
      toast.success("Workspace settings saved");
    } catch {
      toast.error("Failed to save workspace settings");
    } finally {
      setWorkspaceSaving(false);
    }
  };

  const saveNotifications = async () => {
    setNotifSaving(true);
    try {
      await api.patch("/api/workspace/notifications", {
        email_notifications: notifications.emailNotifications,
        new_conversation_alert: notifications.newConversationAlert,
        message_from_visitor: notifications.messageFromVisitor,
        weekly_digest: notifications.weeklyDigest,
        mention_alert: notifications.mentionAlert,
      });
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save notification preferences");
    } finally {
      setNotifSaving(false);
    }
  };

  const allTabs: { key: Tab; label: string; icon: typeof Building2; minRole: string }[] = [
    { key: "account", label: "Account", icon: User, minRole: "agent" },
    { key: "general", label: "General", icon: Building2, minRole: "admin" },
    { key: "notifications", label: "Notifications", icon: Bell, minRole: "agent" },
    { key: "billing", label: "Billing", icon: CreditCard, minRole: "owner" },
  ];

  const roleHierarchy: Record<string, number> = { agent: 0, admin: 1, owner: 2 };
  const userRole = user?.role || "agent";
  const tabs = allTabs.filter((t) => (roleHierarchy[userRole] || 0) >= (roleHierarchy[t.minRole] || 0));

  const SaveButton = ({
    saving,
    onClick,
  }: {
    saving: boolean;
    onClick: () => void;
  }) => (
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
                            toast.success("Name updated");
                          } catch {
                            toast.error("Failed to update name");
                          }
                        }}
                        className="mt-1 shrink-0 rounded-md bg-ink px-4 py-2 text-sm text-primary-foreground"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <p className="mt-1 text-sm text-ink">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Chat Language</label>
                    <p className="text-xs text-muted-foreground mb-2">Customer messages will be auto-translated to this language for you</p>
                    <div className="flex max-w-md gap-2">
                      <select
                        value={agentLanguage}
                        onChange={(e) => setAgentLanguage(e.target.value)}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                      >
                        <option value="en">English</option>
                        <option value="ar">Arabic (العربية)</option>
                        <option value="az">Azerbaijani (Azərbaycan)</option>
                        <option value="bn">Bengali (বাংলা)</option>
                        <option value="bg">Bulgarian (Български)</option>
                        <option value="ca">Catalan (Català)</option>
                        <option value="zh-Hans">Chinese Simplified (简体中文)</option>
                        <option value="zh-Hant">Chinese Traditional (繁體中文)</option>
                        <option value="cs">Czech (Čeština)</option>
                        <option value="da">Danish (Dansk)</option>
                        <option value="nl">Dutch (Nederlands)</option>
                        <option value="eo">Esperanto</option>
                        <option value="et">Estonian (Eesti)</option>
                        <option value="fi">Finnish (Suomi)</option>
                        <option value="fr">French (Français)</option>
                        <option value="gl">Galician (Galego)</option>
                        <option value="de">German (Deutsch)</option>
                        <option value="el">Greek (Ελληνικά)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                        <option value="he">Hebrew (עברית)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="hu">Hungarian (Magyar)</option>
                        <option value="id">Indonesian (Bahasa Indonesia)</option>
                        <option value="ga">Irish (Gaeilge)</option>
                        <option value="it">Italian (Italiano)</option>
                        <option value="ja">Japanese (日本語)</option>
                        <option value="ko">Korean (한국어)</option>
                        <option value="ky">Kyrgyz (Кыргызча)</option>
                        <option value="lv">Latvian (Latviešu)</option>
                        <option value="lt">Lithuanian (Lietuvių)</option>
                        <option value="mk">Macedonian (Македонски)</option>
                        <option value="ms">Malay (Bahasa Melayu)</option>
                        <option value="mt">Maltese (Malti)</option>
                        <option value="nb">Norwegian Bokmål (Norsk)</option>
                        <option value="fa">Persian (فارسی)</option>
                        <option value="pl">Polish (Polski)</option>
                        <option value="pt">Portuguese (Português)</option>
                        <option value="pt-BR">Portuguese BR (Português do Brasil)</option>
                        <option value="ro">Romanian (Română)</option>
                        <option value="ru">Russian (Русский)</option>
                        <option value="sr">Serbian (Српски)</option>
                        <option value="sk">Slovak (Slovenčina)</option>
                        <option value="sl">Slovenian (Slovenščina)</option>
                        <option value="es">Spanish (Español)</option>
                        <option value="sw">Swahili (Kiswahili)</option>
                        <option value="sv">Swedish (Svenska)</option>
                        <option value="tl">Tagalog</option>
                        <option value="th">Thai (ไทย)</option>
                        <option value="tr">Turkish (Türkçe)</option>
                        <option value="uk">Ukrainian (Українська)</option>
                        <option value="ur">Urdu (اردو)</option>
                        <option value="vi">Vietnamese (Tiếng Việt)</option>
                      </select>
                      <button
                        onClick={async () => {
                          try {
                            await api.patch("/api/auth/me", { language: agentLanguage });
                            toast.success("Language updated");
                          } catch {
                            toast.error("Failed to update language");
                          }
                        }}
                        className="mt-1 shrink-0 rounded-md bg-ink px-4 py-2 text-sm text-primary-foreground"
                      >
                        Save
                      </button>
                    </div>
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
                            toast.success("Password updated");
                            setOldPassword("");
                            setNewPassword("");
                          } catch (err: any) {
                            toast.error(err.message || "Failed to update password");
                          }
                        }}
                        className="rounded-md bg-ink px-4 py-2 text-sm text-primary-foreground"
                      >
                        Update Password
                      </button>
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
                  <SaveButton saving={workspaceSaving} onClick={saveWorkspace} />
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

            {tab === "notifications" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-ink">Notifications</h2>
                    <p className="text-xs text-muted-foreground mt-1">Manage how you receive alerts</p>
                  </div>
                  <SaveButton saving={notifSaving} onClick={saveNotifications} />
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
