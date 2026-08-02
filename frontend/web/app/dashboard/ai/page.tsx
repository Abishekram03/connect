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

export default function AIPage() {
  const toast = useToast();
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

  useEffect(() => {
    loadSources();
  }, []);

  useEffect(() => {
    testEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

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
      <div className="flex flex-1 overflow-hidden bg-card shadow-sm">
        {/* Left sidebar — sources */}
        <div className="flex w-full md:w-80 shrink-0 flex-col border-r border-border">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Bot className="h-5 w-5 text-accent" />
            <h2 className="text-sm font-semibold text-ink">AI Training</h2>
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
