"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Globe,
  FileText,
  Trash2,
  Upload,
  Bot,
  Send,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Database,
  Settings,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Zap,
} from "lucide-react";
import {
  fetchAIConfig,
  updateAIConfig,
  fetchSources,
  createSource,
  deleteSource,
  syncSource,
  syncAllSources,
  syncKBToSources,
  type AIConfig,
  type KnowledgeSource,
} from "@/lib/ai-service";
import { useToast } from "@/components/toast";

type Tab = "sources" | "settings";

export default function AIPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("sources");
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceType, setSourceType] = useState<"manual" | "website">("manual");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingKB, setSyncingKB] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [configSaving, setConfigSaving] = useState(false);

  // Test chat
  const [testMessages, setTestMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [testInput, setTestInput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const testEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    testEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [srcs, cfg] = await Promise.allSettled([fetchSources(), fetchAIConfig()]);
      if (srcs.status === "fulfilled") setSources(srcs.value);
      if (cfg.status === "fulfilled") setConfig(cfg.value);
    } catch {
    } finally {
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
      loadData();
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
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncingKB(false);
    }
  };

  const handleConfigToggle = async (key: keyof AIConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
    setConfigSaving(true);
    try {
      const updated = await updateAIConfig({ [key]: value });
      setConfig(updated);
      toast.success("Settings saved");
    } catch (err: any) {
      setConfig({ ...config, [key]: !value });
      toast.error(err.message || "Save failed");
    } finally {
      setConfigSaving(false);
    }
  };

  const handleConfigChange = async (key: keyof AIConfig, value: any) => {
    if (!config) return;
    setConfigSaving(true);
    try {
      const updated = await updateAIConfig({ [key]: value });
      setConfig(updated);
      toast.success("Settings saved");
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setConfigSaving(false);
    }
  };

  const handleTestChat = async () => {
    if (!testInput.trim() || testLoading) return;
    const msg = testInput.trim();
    setTestMessages((prev) => [...prev, { role: "user", text: msg }]);
    setTestInput("");
    setTestLoading(true);

    // We don't have a dedicated test-chat endpoint yet — simulate with summarize
    // This will be replaced when the test chat endpoint is added
    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `I received your question: "${msg}"\n\nThis is a test interface. The AI will respond based on your training sources once configured with an API key and indexed sources.`,
        },
      ]);
      setTestLoading(false);
    }, 800);
  };

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 overflow-hidden bg-card shadow-sm">
        {/* Left sidebar */}
        <div className="flex w-full md:w-80 shrink-0 flex-col border-r border-border">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent" />
              <h2 className="text-sm font-semibold text-ink">AI Training</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTab("sources")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  tab === "sources" ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-ink"
                }`}
              >
                Sources
              </button>
              <button
                onClick={() => setTab("settings")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  tab === "settings" ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-ink"
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          {tab === "sources" ? (
            <>
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
            </>
          ) : (
            /* Settings tab */
            <div className="flex-1 overflow-y-auto p-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !config ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Settings className="mb-3 h-10 w-10 text-border" />
                  <p>AI not configured</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Auto-reply toggle */}
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">Widget Auto-Reply</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">AI answers customer messages first</p>
                      </div>
                      <button
                        onClick={() => handleConfigToggle("auto_reply_enabled", !config.auto_reply_enabled)}
                        disabled={configSaving}
                      >
                        {config.auto_reply_enabled ? (
                          <ToggleRight className="h-8 w-8 text-accent" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Model */}
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Model</p>
                    <select
                      value={config.model_name}
                      onChange={(e) => handleConfigChange("model_name", e.target.value)}
                      className="w-full rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-ink outline-none"
                    >
                      <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                      <option value="openai/gpt-4o">GPT-4o</option>
                      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
                    </select>
                  </div>

                  {/* Temperature */}
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Temperature</p>
                      <span className="text-xs font-mono text-ink">{config.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setConfig({ ...config, temperature: val });
                      }}
                      onMouseUp={() => handleConfigChange("temperature", config.temperature)}
                      onTouchEnd={() => handleConfigChange("temperature", config.temperature)}
                      className="w-full accent-accent"
                    />
                  </div>

                  {/* Confidence threshold */}
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-muted-foreground">Confidence Threshold</p>
                      <span className="text-xs font-mono text-ink">{config.confidence_threshold}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.confidence_threshold}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setConfig({ ...config, confidence_threshold: val });
                      }}
                      onMouseUp={() => handleConfigChange("confidence_threshold", config.confidence_threshold)}
                      onTouchEnd={() => handleConfigChange("confidence_threshold", config.confidence_threshold)}
                      className="w-full accent-accent"
                    />
                  </div>

                  {/* Escalation toggles */}
                  <div className="rounded-lg border border-border p-3 space-y-3">
                    <p className="text-xs font-semibold text-ink">Escalation</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-ink">Escalate on anger</p>
                        <p className="text-[10px] text-muted-foreground">Detect frustrated customers</p>
                      </div>
                      <button onClick={() => handleConfigToggle("escalate_on_angry", !config.escalate_on_angry)}>
                        {config.escalate_on_angry ? <ToggleRight className="h-7 w-7 text-accent" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-ink">Escalate on low confidence</p>
                        <p className="text-[10px] text-muted-foreground">Transfer when unsure</p>
                      </div>
                      <button onClick={() => handleConfigToggle("escalate_on_low_confidence", !config.escalate_on_low_confidence)}>
                        {config.escalate_on_low_confidence ? <ToggleRight className="h-7 w-7 text-accent" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-ink">Max AI turns</p>
                        <p className="text-[10px] text-muted-foreground">Before human handoff</p>
                      </div>
                      <select
                        value={config.max_ai_turns}
                        onChange={(e) => handleConfigChange("max_ai_turns", parseInt(e.target.value))}
                        className="rounded-md border border-border bg-white px-2 py-1 text-xs text-ink outline-none"
                      >
                        {[3, 5, 7, 10].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">API Key</p>
                    <input
                      type="password"
                      value={config.provider_api_key}
                      onChange={(e) => setConfig({ ...config, provider_api_key: e.target.value })}
                      onBlur={() => handleConfigChange("provider_api_key", config.provider_api_key)}
                      placeholder="sk-or-..."
                      className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-muted-foreground"
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">OpenRouter or OmniRoute API key</p>
                  </div>

                  {/* Base URL */}
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">API Base URL</p>
                    <input
                      type="url"
                      value={config.provider_base_url}
                      onChange={(e) => setConfig({ ...config, provider_base_url: e.target.value })}
                      onBlur={() => handleConfigChange("provider_base_url", config.provider_base_url)}
                      className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-ink outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel — source detail or test chat */}
        {tab === "sources" ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
              <Bot className="h-5 w-5 text-accent" />
              <h2 className="text-sm font-semibold text-ink">AI Test Chat</h2>
              <span className="text-[11px] text-muted-foreground">(uses indexed sources)</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {testMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bot className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Ask questions based on your training sources</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Sources must be indexed first</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                        m.role === "user" ? "bg-ink text-primary-foreground" : "bg-surface-2 text-ink"
                      }`}>
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
        ) : (
          /* Settings tab right: config summary */
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <Zap className="h-16 w-16 text-accent/30 mb-4" />
            <h3 className="text-lg font-semibold text-ink mb-2">AI Configuration</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Configure your AI model, API key, and behavior settings in the left panel.
              Enable auto-reply to let AI handle customer messages automatically.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-lg font-bold text-ink">{sources.filter((s) => s.is_indexed).length}</p>
                <p className="text-[11px] text-muted-foreground">Indexed Sources</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-lg font-bold text-ink">{sources.reduce((a, s) => a + s.chunk_count, 0)}</p>
                <p className="text-[11px] text-muted-foreground">Total Chunks</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-lg font-bold text-ink">{config?.auto_reply_enabled ? "On" : "Off"}</p>
                <p className="text-[11px] text-muted-foreground">Auto-Reply</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="text-lg font-bold text-ink truncate">{config?.model_name.split("/").pop() || "—"}</p>
                <p className="text-[11px] text-muted-foreground">Model</p>
              </div>
            </div>
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
