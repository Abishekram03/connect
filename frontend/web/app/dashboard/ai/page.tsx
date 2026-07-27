"use client";

import { useState, useRef } from "react";
import {
  Plus,
  X,
  Globe,
  FileText,
  Link,
  Trash2,
  Upload,
  MessageSquare,
  Sparkles,
  Send,
  RefreshCw,
  Bot,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

type SourceType = "article" | "website" | "document";
type SourceStatus = "processing" | "ready" | "error";

interface Source {
  id: string;
  type: SourceType;
  title: string;
  url?: string;
  status: SourceStatus;
  createdAt: string;
  chunks: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const TYPE_ICONS: Record<SourceType, typeof Globe> = {
  article: FileText,
  website: Globe,
  document: FileText,
};

const TYPE_LABELS: Record<SourceType, string> = {
  article: "Article",
  website: "Website",
  document: "Document",
};

const defaultSources: Source[] = [];

export default function AIPage() {
  const [sources, setSources] = useState<Source[]>(defaultSources);
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceType, setSourceType] = useState<SourceType>("article");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "assistant", content: "Hello! I'm your AI assistant. Ask me anything based on your training sources." },
  ]);
  const [input, setInput] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addSource = () => {
    if (!sourceTitle.trim()) return;
    const source: Source = {
      id: `s${Date.now()}`,
      type: sourceType,
      title: sourceTitle,
      url: sourceUrl || undefined,
      status: "processing",
      createdAt: new Date().toISOString().split("T")[0],
      chunks: 0,
    };
    setSources([source, ...sources]);
    setShowAddSource(false);
    setSourceTitle("");
    setSourceUrl("");
    setSourceContent("");
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, status: "ready" as const, chunks: Math.floor(Math.random() * 50) + 5 } : s))
      );
    }, 2000);
  };

  const removeSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
    if (selectedSource?.id === id) setSelectedSource(null);
  };

  const trainAll = () => {
    setIsTraining(true);
    setSources((prev) => prev.map((s) => ({ ...s, status: "processing" as const })));
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) => ({ ...s, status: "ready" as const, chunks: Math.floor(Math.random() * 50) + 5 }))
      );
      setIsTraining(false);
    }, 3000);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: `m${Date.now()}`, role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      const responses = [
        "Based on your training sources, here's what I found...",
        "I can help you with that. According to the documentation...",
        "Let me check the knowledge base for you.",
        "Here are the relevant insights from your sources.",
      ];
      const aiMsg: Message = {
        id: `m${Date.now()}`,
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 overflow-hidden bg-card shadow-sm">
        <div className="flex w-full md:w-80 shrink-0 flex-col border-r border-border">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-sm font-semibold text-ink">AI Training</h2>
            </div>
            <button
              onClick={() => setShowAddSource(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {sources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                <FileText className="mb-3 h-10 w-10 text-border" />
                <p>No sources added yet</p>
                <button onClick={() => setShowAddSource(true)} className="mt-2 text-accent hover:underline">
                  Add your first source
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {sources.map((source) => {
                  const Icon = TYPE_ICONS[source.type];
                  return (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(source)}
                      className={`w-full rounded-lg px-4 py-2.5 text-left transition-colors ${
                        selectedSource?.id === source.id ? "bg-surface-2" : "hover:bg-surface-2"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <p className="text-sm font-medium text-ink truncate">{source.title}</p>
                        </div>
                        {source.status === "processing" ? (
                          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-amber-500" />
                        ) : source.status === "error" ? (
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                        ) : (
                          <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2.5 text-xs text-muted-foreground">
                        <span>{TYPE_LABELS[source.type]}</span>
                        {source.chunks > 0 && <span>{source.chunks} chunks</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <button
              onClick={trainAll}
              disabled={isTraining || sources.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              {isTraining ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {isTraining ? "Training..." : "Retrain All"}
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {selectedSource ? (
            <div className="flex flex-1 flex-col overflow-y-auto p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-semibold text-ink">{selectedSource.title}</h2>
                    {selectedSource.status === "ready" && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[11px] text-green-700">
                        <Check className="h-3.5 w-3.5" />
                        Ready
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {TYPE_LABELS[selectedSource.type]} &middot; {selectedSource.chunks} chunks &middot; Added {selectedSource.createdAt}
                  </p>
                </div>
                <button
                  onClick={() => removeSource(selectedSource.id)}
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-medium text-muted-foreground">Chunks</p>
                  <p className="mt-1 text-xl font-semibold text-ink">{selectedSource.chunks}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-medium text-muted-foreground">Type</p>
                  <p className="mt-1 text-base font-medium text-ink">{TYPE_LABELS[selectedSource.type]}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="mt-1 text-base font-medium capitalize text-ink">{selectedSource.status}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source Preview</p>
                <p className="text-sm text-ink leading-relaxed">
                  Content preview for {selectedSource.title}. This source has been processed into {selectedSource.chunks} chunks
                  and is ready for AI queries. The AI will use this content to provide accurate responses to customer inquiries.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-2.5 border-b border-border px-5 py-3">
                <Bot className="h-5 w-5 text-accent" />
                <h2 className="text-sm font-semibold text-ink">AI Test Chat</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                        msg.role === "user"
                          ? "bg-ink text-primary-foreground"
                          : "bg-surface-2 text-ink"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask the AI based on your sources..."
                    className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-primary-foreground hover:opacity-90 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
              {(["article", "website", "document"] as SourceType[]).map((type) => {
                const Icon = TYPE_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSourceType(type)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors ${
                      sourceType === type
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder={sourceType === "website" ? "e.g. Company Website" : "e.g. Product Guide"}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>

              {sourceType === "website" && (
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

              {sourceType === "article" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Content</label>
                  <textarea
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    placeholder="Paste your article content here..."
                    rows={5}
                    className="mt-1.5 w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground"
                  />
                </div>
              )}

              {sourceType === "document" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Upload Document</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface py-6 text-sm text-muted-foreground hover:border-accent hover:text-accent"
                  >
                    <Upload className="mb-1.5 h-6 w-6" />
                    <p>Click to upload PDF, DOCX, or TXT</p>
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" />
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => setShowAddSource(false)} className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={addSource}
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
