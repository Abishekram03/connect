"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  Building2,
  Bell,
  CreditCard,
  Check,
  User,
  Loader2,
  Bot,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/toast";
import { fetchAIConfig, updateAIConfig, type AIConfig } from "@/lib/ai-service";

type Tab = "account" | "general" | "ai" | "notifications" | "billing";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("account");

  const [accountName, setAccountName] = useState(user?.name || "");
  const [agentLanguage, setAgentLanguage] = useState(user?.language || "en");
  const [autoTranslateOn, setAutoTranslateOn] = useState(
    typeof window !== "undefined" ? localStorage.getItem("auto_translate") !== "off" : true
  );
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
    soundEnabled: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [langSaving, setLangSaving] = useState(false);
  const langTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [settingsReloadKey, setSettingsReloadKey] = useState(0);

  useEffect(() => {
    setAccountName(user?.name || "");
    setWorkspace({
      name: user?.organization?.name || "",
      slug: user?.organization?.slug || "",
      timezone: user?.organization?.timezone || "UTC",
    });
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    if (authLoading) return;

    if (!user) {
      setAiConfig(null);
      setAiError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAiError(null);

    Promise.all([
      api.get<any>("/api/workspace/notifications").catch(() => null),
      fetchAIConfig().catch((error) => {
        if (error?.status === 401) {
          throw error;
        }
        return null;
      }),
    ])
      .then(([n, ai]) => {
        if (cancelled) return;

        if (n) {
          setNotifications({
            emailNotifications: n.email_notifications ?? true,
            newConversationAlert: n.new_conversation_alert ?? true,
            messageFromVisitor: n.message_from_visitor ?? true,
            weeklyDigest: n.weekly_digest ?? false,
            mentionAlert: n.mention_alert ?? true,
            soundEnabled: localStorage.getItem("notification_sound") !== "off",
          });
        }

        if (ai) {
          setAiConfig(ai);
        } else {
          setAiError("AI settings could not be loaded.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAiError("AI settings could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, settingsReloadKey]);

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

  const saveNotifications = useCallback(
    async (notifs: typeof notifications) => {
      setNotifSaving(true);
      try {
        await api.patch("/api/workspace/notifications", {
          email_notifications: notifs.emailNotifications,
          new_conversation_alert: notifs.newConversationAlert,
          message_from_visitor: notifs.messageFromVisitor,
          weekly_digest: notifs.weeklyDigest,
          mention_alert: notifs.mentionAlert,
        });
        toast.success("Notification preferences saved");
      } catch {
        toast.error("Failed to save notification preferences");
      } finally {
        setNotifSaving(false);
      }
    },
    [],
  );

  const debouncedSaveNotifs = useCallback(
    (notifs: typeof notifications) => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      notifTimerRef.current = setTimeout(() => saveNotifications(notifs), 800);
    },
    [saveNotifications],
  );

  const toggleNotification = (key: keyof typeof notifications) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    if (key === "soundEnabled") {
      localStorage.setItem(
        "notification_sound",
        next.soundEnabled ? "on" : "off",
      );
    } else {
      debouncedSaveNotifs(next);
    }
  };

  const debouncedSaveLang = useCallback((lang: string) => {
    if (langTimerRef.current) clearTimeout(langTimerRef.current);
    langTimerRef.current = setTimeout(async () => {
      setLangSaving(true);
      try {
        await api.patch("/api/auth/me", { language: lang });
        toast.success("Language updated");
      } catch {
        toast.error("Failed to update language");
      } finally {
        setLangSaving(false);
      }
    }, 800);
  }, []);

  const saveAIField = async <K extends keyof AIConfig>(
    key: K,
    value: AIConfig[K],
  ) => {
    if (!aiConfig || aiSaving) return;

    const previous = aiConfig;
    setAiConfig({ ...previous, [key]: value });
    setAiSaving(true);
    try {
      const updated = await updateAIConfig({
        [key]: value,
      } as Partial<AIConfig>);
      setAiConfig(updated);
      setAiError(null);
      toast.success("AI settings saved");
    } catch {
      setAiConfig(previous);
      toast.error("Failed to save AI settings");
    } finally {
      setAiSaving(false);
    }
  };

  const handleAIToggle = (
    key: "auto_reply_enabled" | "reply_generation_enabled",
  ) => {
    if (!aiConfig) return;
    saveAIField(key, !aiConfig[key]);
  };

  const allTabs: {
    key: Tab;
    label: string;
    icon: typeof Building2;
    minRole: string;
  }[] = [
    { key: "account", label: "Account", icon: User, minRole: "agent" },
    { key: "general", label: "General", icon: Building2, minRole: "admin" },
    { key: "ai", label: "AI", icon: Bot, minRole: "admin" },
    {
      key: "notifications",
      label: "Notifications",
      icon: Bell,
      minRole: "agent",
    },
    { key: "billing", label: "Billing", icon: CreditCard, minRole: "owner" },
  ];

  const roleHierarchy: Record<string, number> = {
    agent: 0,
    admin: 1,
    owner: 2,
  };
  const userRole = user?.role || "agent";
  const tabs = allTabs.filter(
    (t) => (roleHierarchy[userRole] || 0) >= (roleHierarchy[t.minRole] || 0),
  );

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
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage your personal information
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Name
                    </label>
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
                            const { updateProfile } =
                              await import("@/lib/auth-service");
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
                    <label className="text-xs font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-ink">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Chat Language
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Customer messages will be auto-translated to this language
                      for you
                    </p>
                    <div className="flex max-w-md gap-2">
                      <select
                        value={agentLanguage}
                        onChange={(e) => {
                          setAgentLanguage(e.target.value);
                          debouncedSaveLang(e.target.value);
                        }}
                        className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                      >
                        <option value="en">English</option>
                        <option value="ar">Arabic (العربية)</option>
                        <option value="az">Azerbaijani (Azərbaycan)</option>
                        <option value="bn">Bengali (বাংলা)</option>
                        <option value="bg">Bulgarian (Български)</option>
                        <option value="ca">Catalan (Català)</option>
                        <option value="zh-Hans">
                          Chinese Simplified (简体中文)
                        </option>
                        <option value="zh-Hant">
                          Chinese Traditional (繁體中文)
                        </option>
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
                        <option value="id">
                          Indonesian (Bahasa Indonesia)
                        </option>
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
                        <option value="pt-BR">
                          Portuguese BR (Português do Brasil)
                        </option>
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
                      {langSaving && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-ink">Auto Translate</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically translate conversations when you open them
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        const next = !autoTranslateOn;
                        setAutoTranslateOn(next);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("auto_translate", next ? "on" : "off");
                        }
                        toast.success(next ? "Auto translate enabled" : "Auto translate disabled");
                      }}
                      className={`relative h-6 w-10 rounded-full transition-colors cursor-pointer ${
                        autoTranslateOn ? "bg-accent" : "bg-border"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          autoTranslateOn ? "translate-x-4.5 left-0.5" : "left-0.5"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-5">
                    <h3 className="text-sm font-semibold text-ink mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          New Password
                        </label>
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
                            const { changePassword } =
                              await import("@/lib/auth-service");
                            await changePassword(oldPassword, newPassword);
                            toast.success("Password updated");
                            setOldPassword("");
                            setNewPassword("");
                          } catch (err: any) {
                            toast.error(
                              err.message || "Failed to update password",
                            );
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
                    <h2 className="text-base font-semibold text-ink">
                      Workspace
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage your workspace settings
                    </p>
                  </div>
                  <SaveButton
                    saving={workspaceSaving}
                    onClick={saveWorkspace}
                  />
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={workspace.name}
                      onChange={(e) =>
                        setWorkspace({ ...workspace, name: e.target.value })
                      }
                      className="mt-1 w-full max-w-md rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Workspace Slug
                    </label>
                    <div className="mt-1 flex max-w-md items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground">
                      <span>app.connect.com/</span>
                      <input
                        type="text"
                        value={workspace.slug}
                        onChange={(e) =>
                          setWorkspace({ ...workspace, slug: e.target.value })
                        }
                        className="flex-1 bg-transparent text-ink outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Timezone
                    </label>
                    <select
                      value={workspace.timezone}
                      onChange={(e) =>
                        setWorkspace({ ...workspace, timezone: e.target.value })
                      }
                      className="mt-1 w-full max-w-md rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="US/Eastern">US/Eastern (ET)</option>
                      <option value="US/Central">US/Central (CT)</option>
                      <option value="US/Pacific">US/Pacific (PT)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Singapore">
                        Asia/Singapore (SGT)
                      </option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                      <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                      <option value="Australia/Sydney">
                        Australia/Sydney (AEST)
                      </option>
                      <option value="America/Sao_Paulo">
                        America/Sao_Paulo (BRT)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {tab === "ai" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-ink">
                      AI Settings
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure AI behavior
                    </p>
                  </div>
                  {aiSaving && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </div>
                  )}
                </div>
                {aiError ? (
                  <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                    <p>{aiError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAiConfig(null);
                        setLoading(true);
                        setAiError(null);
                        setSettingsReloadKey((value) => value + 1);
                      }}
                      className="mt-3 rounded-md bg-ink px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                    >
                      Retry loading
                    </button>
                  </div>
                ) : !aiConfig ? (
                  <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                    <Bot className="mb-3 h-10 w-10 text-border" />
                    <p>Loading AI settings...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleAIToggle("auto_reply_enabled")}
                      disabled={aiSaving}
                      aria-pressed={aiConfig.auto_reply_enabled}
                      className="flex w-full items-center justify-between rounded-lg border border-border px-5 py-4 text-left cursor-pointer hover:bg-surface-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          Auto Reply
                        </p>
                        <p className="text-xs text-muted-foreground">
                          AI automatically replies to customer messages in the
                          widget
                        </p>
                      </div>
                      <div
                        className={`relative h-6 w-10 rounded-full transition-colors ${aiConfig.auto_reply_enabled ? "bg-accent" : "bg-border"}`}
                      >
                        <div
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${aiConfig.auto_reply_enabled ? "translate-x-4.5 left-0.5" : "left-0.5"}`}
                        />
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAIToggle("reply_generation_enabled")}
                      disabled={aiSaving}
                      aria-pressed={aiConfig.reply_generation_enabled}
                      className="flex w-full items-center justify-between rounded-lg border border-border px-5 py-4 text-left cursor-pointer hover:bg-surface-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          Reply Generation
                        </p>
                        <p className="text-xs text-muted-foreground">
                          AI suggests replies to agents in the inbox
                        </p>
                      </div>
                      <div
                        className={`relative h-6 w-10 rounded-full transition-colors ${aiConfig.reply_generation_enabled ? "bg-accent" : "bg-border"}`}
                      >
                        <div
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${aiConfig.reply_generation_enabled ? "translate-x-4.5 left-0.5" : "left-0.5"}`}
                        />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "notifications" && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-ink">
                      Notifications
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage how you receive alerts
                    </p>
                  </div>
                  {notifSaving && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {(
                    [
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        desc: "Receive notifications via email",
                      },
                      {
                        key: "newConversationAlert",
                        label: "New Conversation",
                        desc: "When a new conversation starts",
                      },
                      {
                        key: "messageFromVisitor",
                        label: "Visitor Messages",
                        desc: "When a visitor sends a message",
                      },
                      {
                        key: "mentionAlert",
                        label: "Mentions",
                        desc: "When you are mentioned in a conversation",
                      },
                      {
                        key: "weeklyDigest",
                        label: "Weekly Digest",
                        desc: "Weekly summary of activity",
                      },
                      {
                        key: "soundEnabled",
                        label: "Notification Sounds",
                        desc: "Play a sound when new notifications arrive",
                      },
                    ] as const
                  ).map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-border px-5 py-3.5 cursor-pointer hover:bg-surface-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div
                        onClick={() => toggleNotification(key)}
                        className={`relative h-6 w-10 rounded-full transition-colors ${
                          notifications[key] ? "bg-accent" : "bg-border"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            notifications[key]
                              ? "translate-x-4.5 left-0.5"
                              : "left-0.5"
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
                  <h2 className="text-base font-semibold text-ink">
                    Billing & Plan
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage your subscription
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CreditCard className="h-14 w-14 text-border mb-4" />
                  <p className="text-base font-medium text-ink">
                    No billing information yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                    Billing details will appear here once you set up your
                    subscription.
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
