"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Globe,
  FileText,
  Trash2,
  Bot,
  Send,
  RefreshCw,
  Check,
  Loader2,
  Database,
  BarChart3,
  Zap,
  AlertTriangle,
  Coins,
  Brain,
  TrendingUp,
} from "lucide-react";
import {
  fetchSources,
  createSource,
  deleteSource,
  syncSource,
  syncAllSources,
  syncKBToSources,
  type KnowledgeSource,
} from "@/lib/ai-service";
import { useToast } from "@/components/toast";
import { api } from "@/lib/api-client";

interface AIAnalytics {
  period: string;
  total_replies: number;
  tokens: { total: number; prompt: number; completion: number };
  avg_confidence: number | null;
  escalation: { total: number; rate: number | null; reasons: Record<string, number> };
  ai_resolved: number;
  model_usage: Record<string, number>;
  daily_trend: { date: string; replies: number; avg_confidence: number; escalated: number }[];
  recent_logs: { id: string; model_used: string; confidence: number; escalated: boolean; escalation_reason: string; prompt_tokens: number; completion_tokens: number; created_at: string; conversation_id: string }[];
}

export default function AIPage() {
  const toast = useToast();
  const [tab, setTab] = useState<"sources" | "analytics">("sources");
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceType, setSourceType] = useState<"manual" | "website">("manual");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingKB, setSyncingKB] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [testMessages, setTestMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [testInput, setTestInput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const testEndRef = useRef<HTMLDivElement>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("7d");

  useEffect(() => {
    loadSources();
  }, []);

  useEffect(() => {
    if (tab === "analytics") {
      loadAnalytics();
    }
  }, [tab, analyticsPeriod]);

  useEffect(() => {
    testEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await api.get(`/api/ai/analytics?period=${analyticsPeriod}`);
      setAnalytics(data);
    } catch {
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadSources = async () => {
    setLoading(true);
    try {
      const srcs = await fetchSources();
      setSources(srcs);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!sourceTitle.trim()) return;
    try {
      const src = await createSource({
        source_type: sourceType === "website" ? "website" : "manual",
        title: sourceTitle,
        content: sourceContent,
        url: sourceUrl,
      });
      setSources((prev) => [src, ...prev]);
      setShowAddSource(false);
      setSourceTitle("");
      setSourceUrl("");
      setSourceContent("");
      toast.success("Source added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add source");
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await deleteSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success("Source deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleSyncSource = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await syncSource(id);
      setSources((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, is_indexed: true, chunk_count: res.chunk_count } : s
        )
      );
      toast.success(`Indexed: ${res.chunk_count} chunks`);
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    try {
      const res = await syncAllSources();
      toast.success(`Synced ${res.sources_synced} sources (${res.total_chunks} chunks)`);
      loadSources();
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncKB = async () => {
    setSyncingKB(true);
    try {
      const res = await syncKBToSources();
      toast.success(`Imported ${res.synced} items from Knowledge Base`);
      loadSources();
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncingKB(false);
    }
  };

  const handleTestChat = async () => {
    if (!testInput.trim() || testLoading) return;
    const msg = testInput.trim();
    setTestMessages((prev) => [...prev, { role: "user", text: msg }]);
    setTestInput("");
    setTestLoading(true);
    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `This is a test interface. The AI will respond based on your training sources once indexed.`,
        },
      ]);
      setTestLoading(false);
    }, 800);
  };

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 overflow-hidden bg-card shadow-sm flex-col">
        {/* Tab header */}
        <div className="flex items-center gap-1 border-b border-border px-4">
          {([
            { key: "sources", label: "Sources", icon: Database },
            { key: "analytics", label: "Analytics", icon: BarChart3 },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "sources" ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar — sources */}
            <div className="flex w-full md:w-80 shrink-0 flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-neutral-200 overflow-hidden">
              <img src="/KAI_Logo.png" alt="Kai" className="h-4 w-4 object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink">Kai AI Assistant</h2>
              <p className="text-[10px] text-muted-foreground">Training Sources</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                <Database className="mb-3 h-10 w-10 text-border" />
                <p>No sources yet</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Add sources or sync your KB</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="group flex items-center gap-2.5 rounded-lg px-3 py-2.5 hover:bg-surface-2 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{source.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="capitalize">{source.source_type.replace("kb_", "")}</span>
                        {source.chunk_count > 0 && <span>{source.chunk_count} chunks</span>}
                      </div>
                    </div>
                    {source.is_indexed ? (
                      <Check className="h-4 w-4 shrink-0 text-green-500" />
                    ) : syncingId === source.id ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" />
                    ) : (
                      <button
                        onClick={() => handleSyncSource(source.id)}
                        className="opacity-0 group-hover:opacity-100 h-4 w-4 shrink-0 text-muted-foreground hover:text-accent transition-all"
                        title="Index this source"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSource(source.id)}
                      className="opacity-0 group-hover:opacity-100 h-4 w-4 shrink-0 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-border p-3">
            <button
              onClick={handleSyncKB}
              disabled={syncingKB}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface py-2 text-xs font-medium text-ink hover:bg-surface-2 disabled:opacity-40 transition-colors"
            >
              {syncingKB ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
              Sync KB Articles & FAQs
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncingAll || sources.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface py-2 text-xs font-medium text-ink hover:bg-surface-2 disabled:opacity-40 transition-colors"
            >
              {syncingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {syncingAll ? "Indexing..." : "Reindex All Sources"}
            </button>
            <button
              onClick={() => setShowAddSource(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Source
            </button>
          </div>
        </div>

        {/* Right panel — test chat */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-neutral-200 overflow-hidden">
              <img src="/KAI_Logo.png" alt="Kai" className="h-3.5 w-3.5 object-contain" />
            </div>
            <h2 className="text-sm font-semibold text-ink">Kai Test Chat</h2>
            <span className="text-[11px] text-muted-foreground">(uses indexed sources)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {testMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 mb-3">
                  <img src="/KAI_Logo.png" alt="Kai" className="h-8 w-8 object-contain" />
                </div>
                <p className="text-sm text-muted-foreground">Ask Kai questions based on your training sources</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Sources must be indexed first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testMessages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-neutral-200 overflow-hidden mt-0.5">
                        <img src="/KAI_Logo.png" alt="Kai" className="h-4 w-4 object-contain" />
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                      m.role === "user" ? "bg-ink text-primary-foreground" : "bg-surface-2 text-ink"
                    }`}>
                      {m.role === "assistant" && (
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Kai</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                {testLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-surface-2 px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={testEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTestChat()}
                placeholder="Ask based on your sources..."
                className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleTestChat}
                disabled={!testInput.trim() || testLoading}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
          </div>
        ) : (
          /* Analytics tab */
          <div className="flex-1 overflow-y-auto p-5">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !analytics ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-border" />
                <p className="text-sm text-muted-foreground">No analytics data yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Period selector */}
                <div className="flex items-center gap-2">
                  {(["today", "7d", "30d"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setAnalyticsPeriod(p)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        analyticsPeriod === p
                          ? "bg-ink text-primary-foreground"
                          : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p === "today" ? "Today" : p === "7d" ? "7 Days" : "30 Days"}
                    </button>
                  ))}
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bot className="h-4 w-4" />
                      <span className="text-xs font-medium">Total Replies</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-ink">{analytics.total_replies}</p>
                    <p className="text-[11px] text-muted-foreground">{analytics.ai_resolved} resolved by AI</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="h-4 w-4" />
                      <span className="text-xs font-medium">Tokens Used</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-ink">{analytics.tokens.total.toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {analytics.tokens.prompt.toLocaleString()} prompt / {analytics.tokens.completion.toLocaleString()} completion
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Brain className="h-4 w-4" />
                      <span className="text-xs font-medium">Avg Confidence</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-ink">
                      {analytics.avg_confidence !== null ? `${(analytics.avg_confidence * 100).toFixed(1)}%` : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">Escalation Rate</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-ink">
                      {analytics.escalation.rate !== null ? `${analytics.escalation.rate}%` : "N/A"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{analytics.escalation.total} escalated</p>
                  </div>
                </div>

                {/* Model usage + Escalation reasons */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="mb-3 text-xs font-semibold text-ink">Model Usage</h3>
                    {Object.keys(analytics.model_usage).length === 0 ? (
                      <p className="text-xs text-muted-foreground">No data</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(analytics.model_usage)
                          .sort(([, a], [, b]) => b - a)
                          .map(([model, count]) => {
                            const pct = analytics.total_replies > 0 ? (count / analytics.total_replies) * 100 : 0;
                            return (
                              <div key={model}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-ink font-medium">{model.split("/").pop()}</span>
                                  <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="mb-3 text-xs font-semibold text-ink">Escalation Reasons</h3>
                    {Object.keys(analytics.escalation.reasons).length === 0 ? (
                      <p className="text-xs text-muted-foreground">No escalations</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(analytics.escalation.reasons)
                          .sort(([, a], [, b]) => b - a)
                          .map(([reason, count]) => {
                            const label = {
                              angry_customer: "Angry Customer",
                              low_confidence: "Low Confidence",
                              explicit_human_request: "Human Request",
                              max_ai_turns_reached: "Max Turns",
                              rate_limit_exceeded: "Rate Limit",
                              provider_error: "Provider Error",
                              generation_error: "Generation Error",
                            }[reason] || reason;
                            return (
                              <div key={reason} className="flex items-center justify-between text-xs">
                                <span className="text-ink">{label}</span>
                                <span className="font-medium text-ink">{count}</span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Daily trend */}
                {analytics.daily_trend.length > 0 && (
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="mb-3 text-xs font-semibold text-ink">Daily Trend</h3>
                    <div className="space-y-1.5">
                      {analytics.daily_trend.map((day) => (
                        <div key={day.date} className="flex items-center gap-3 text-xs">
                          <span className="w-20 shrink-0 text-muted-foreground">
                            {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <div className="flex-1">
                            <div className="h-4 overflow-hidden rounded bg-surface-2">
                              <div
                                className="h-full rounded bg-accent"
                                style={{
                                  width: `${analytics.total_replies > 0 ? (day.replies / analytics.total_replies) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className="w-8 text-right font-medium text-ink">{day.replies}</span>
                          <span className="w-12 text-right text-muted-foreground">
                            {day.avg_confidence > 0 ? `${(day.avg_confidence * 100).toFixed(0)}%` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent logs */}
                {analytics.recent_logs.length > 0 && (
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="mb-3 text-xs font-semibold text-ink">Recent AI Replies</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-left text-muted-foreground">
                            <th className="pb-2 font-medium">Model</th>
                            <th className="pb-2 font-medium">Confidence</th>
                            <th className="pb-2 font-medium">Tokens</th>
                            <th className="pb-2 font-medium">Status</th>
                            <th className="pb-2 font-medium">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recent_logs.map((log) => (
                            <tr key={log.id} className="border-b border-border/50">
                              <td className="py-2 text-ink">{log.model_used.split("/").pop()}</td>
                              <td className="py-2 text-ink">{(log.confidence * 100).toFixed(1)}%</td>
                              <td className="py-2 text-muted-foreground">{log.prompt_tokens + log.completion_tokens}</td>
                              <td className="py-2">
                                {log.escalated ? (
                                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                                    Escalated
                                  </span>
                                ) : (
                                  <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                                    Resolved
                                  </span>
                                )}
                              </td>
                              <td className="py-2 text-muted-foreground">
                                {new Date(log.created_at).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Source Modal */}
      {showAddSource && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowAddSource(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Add Source</h3>
              <button onClick={() => setShowAddSource(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5 flex gap-2.5">
              {(["manual", "website"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSourceType(type)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    sourceType === type
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "manual" ? <FileText className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  {type === "manual" ? "Manual Entry" : "Website URL"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. Product FAQ"
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>
              {sourceType === "manual" ? (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Content</label>
                  <textarea
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    placeholder="Paste your content here..."
                    rows={6}
                    className="mt-1.5 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Website URL</label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://example.com/docs"
                    className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => setShowAddSource(false)} className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={handleAddSource}
                disabled={!sourceTitle.trim()}
                className="rounded-md bg-ink px-3 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                Add Source
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
