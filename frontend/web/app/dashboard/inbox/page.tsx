"use client";

import {
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Sparkles,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Inbox,
  AtSign,
  UserCheck,
  LayoutDashboard,
  Users,
  PenLine,
  Plus,
  Bot,
} from "lucide-react";
import { useState } from "react";

type FilterKey = "assigned" | "mentioned" | "all" | "dashboard";

function StatusDot({ online }: { online: boolean }) {
  return (
    <div
      className={`absolute bottom-0 right-0 h-2.5 w-2.5 translate-x-1/3 translate-y-1/3 rounded-sm border-2 border-card ${
        online ? "bg-accent" : "bg-surface-2"
      }`}
    />
  );
}

const workspaceTeams = [
  {
    name: "Support",
    members: [
      { initials: "JD", name: "Jordan Diaz", online: true },
      { initials: "AL", name: "Alex Li", online: true },
      { initials: "KM", name: "Katie Moore", online: false },
    ],
  },
  {
    name: "Sales",
    members: [
      { initials: "RN", name: "Ryan Nakamura", online: true },
      { initials: "SP", name: "Sophia Park", online: false },
    ],
  },
  {
    name: "Billing",
    members: [
      { initials: "TC", name: "Tom Cruz", online: true },
      { initials: "LV", name: "Lisa Varghese", online: true },
    ],
  },
  {
    name: "Engineering",
    members: [
      { initials: "MK", name: "Mike Kwan", online: false },
      { initials: "JR", name: "Julia Roth", online: true },
      { initials: "DP", name: "Dan Peters", online: true },
    ],
  },
];

const conversationData = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah@acme.co",
    preview: "Hi! I'm having trouble with the API rate limiting. We're hitting the 1000 req/hour cap and need it increased for our production deployment.",
    time: "2m",
    unread: true,
    channel: "chat" as const,
    status: "urgent" as const,
    assignee: "JD",
    avatar: "SC",
    color: "bg-coral",
    online: true,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    email: "marcus@techstart.io",
    preview: "Thanks for the quick response! The fix worked perfectly.",
    time: "15m",
    unread: false,
    channel: "email" as const,
    status: "closed" as const,
    assignee: null,
    avatar: "MJ",
    color: "bg-blue-400",
    online: false,
  },
  {
    id: 3,
    name: "Priya Patel",
    email: "priya@designhub.com",
    preview: "Is there a way to customize the chat widget colors to match our brand? We need the primary button to be #FF6B35.",
    time: "1h",
    unread: true,
    channel: "chat" as const,
    status: "open" as const,
    assignee: "AL",
    avatar: "PP",
    color: "bg-emerald-400",
    online: true,
  },
  {
    id: 4,
    name: "Alex Rodriguez",
    email: "alex@buildlab.dev",
    preview: "Getting a 403 error when trying to access the knowledge base API. Here's the curl command I'm using...",
    time: "2h",
    unread: false,
    channel: "chat" as const,
    status: "open" as const,
    assignee: "JD",
    avatar: "AR",
    color: "bg-amber-400",
    online: true,
  },
  {
    id: 5,
    name: "Emily Watson",
    email: "emily@shopzone.com",
    preview: "Do you offer volume discounts? We're looking at about 50 agents and wanted to know if there's an enterprise plan.",
    time: "3h",
    unread: false,
    channel: "email" as const,
    status: "closed" as const,
    assignee: null,
    avatar: "EW",
    color: "bg-purple-400",
    online: false,
  },
  {
    id: 6,
    name: "David Kim",
    email: "david@codelabs.io",
    preview: "The AI suggestions are great but sometimes they don't quite match our tone of voice. Can we train it on past conversations?",
    time: "5h",
    unread: false,
    channel: "chat" as const,
    status: "pending" as const,
    assignee: "AL",
    avatar: "DK",
    color: "bg-rose-400",
    online: true,
  },
];

type Conversation = (typeof conversationData)[0];

const messageData = [
  {
    id: 1,
    from: "customer" as const,
    name: "Sarah Chen",
    text: "Hi! I'm having trouble with the API rate limiting. We're hitting the 1000 req/hour cap and need it increased for our production deployment.",
    time: "10:23 AM",
  },
  {
    id: 2,
    from: "agent" as const,
    name: "Jordan Diaz",
    text: "Hi Sarah! I can help with that. Let me check your current plan and see what we can do. Could you tell me which endpoints you're hitting most frequently?",
    time: "10:25 AM",
    seen: true,
  },
  {
    id: 3,
    from: "customer" as const,
    name: "Sarah Chen",
    text: "We're mainly using the conversations endpoint and the messages endpoint. We have about 800 customers and each one triggers multiple API calls.",
    time: "10:28 AM",
  },
  {
    id: 4,
    from: "agent" as const,
    name: "Jordan Diaz",
    text: "That makes sense. Looking at your account, you're on the Growth plan which has 1000 req/hour. I can temporarily increase this to 5000 req/hour while we figure out a permanent solution.",
    time: "10:30 AM",
    isInternal: true,
  },
  {
    id: 5,
    from: "agent" as const,
    name: "Jordan Diaz",
    text: "I've gone ahead and increased your rate limit to 5000 req/hour. This should cover your current needs. For the long term, I'd recommend looking at our Enterprise plan which has unlimited API access.",
    time: "10:32 AM",
    seen: false,
  },
  {
    id: 6,
    from: "customer" as const,
    name: "Sarah Chen",
    text: "That's perfect, thank you! 5000 should be more than enough for now. I'll check out the Enterprise plan details.",
    time: "10:35 AM",
  },
  {
    id: 7,
    from: "agent" as const,
    name: "Jordan Diaz",
    text: "Great! I've also added a note to our team to follow up with you about the Enterprise plan next week. Is there anything else I can help with?",
    time: "10:38 AM",
    seen: false,
  },
  {
    id: 8,
    from: "customer" as const,
    name: "Sarah Chen",
    text: "Nope, that's all for now. Thanks so much for the quick help!",
    time: "10:40 AM",
  },
];

export default function InboxPage() {
  const [activeConvo, setActiveConvo] = useState<Conversation>(conversationData[0]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [showDetails] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState("Support");

  return (
    <div className="flex h-full flex-col p-0 md:pl-3 md:pt-3">
      <div className="flex flex-1 overflow-hidden rounded-none md:rounded-tl-lg bg-card shadow-sm">
        <SectionSidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
      />
      {activeFilter === "dashboard" ? (
        <DashboardView />
      ) : (
        <>
          <ConversationList
            activeFilter={activeFilter}
            conversations={conversationData}
            activeId={activeConvo.id}
            onSelect={setActiveConvo}
          />
          <ChatPanel conversation={activeConvo} messages={messageData} />
          {showDetails && <UserDetailsPanel conversation={activeConvo} />}
        </>
      )}
      </div>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Conversations", value: "1,247", change: "+12%", up: true },
          { label: "Resolved Today", value: "86", change: "+8%", up: true },
          { label: "Avg Response Time", value: "2.4m", change: "-18%", up: true },
          { label: "Customer Satisfaction", value: "94%", change: "+2%", up: true },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-card shadow-sm p-3">
            <p className="text-[10px] font-medium text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{kpi.value}</p>
            <p className={`mt-0.5 text-[10px] ${kpi.up ? "text-accent-foreground" : "text-red-500"}`}>
              {kpi.change} vs last week
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
        <div className="rounded-lg bg-card shadow-sm p-3">
          <h3 className="text-xs font-semibold text-ink">Conversations by Channel</h3>
          <div className="mt-3 space-y-2">
            {[
              { channel: "Chat", count: 680, pct: 55, color: "bg-accent" },
              { channel: "Email", count: 370, pct: 30, color: "bg-blue-400" },
              { channel: "Phone", count: 197, pct: 15, color: "bg-amber-400" },
            ].map((c) => (
              <div key={c.channel}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{c.channel}</span>
                  <span className="text-ink">{c.count}</span>
                </div>
                <div className="mt-0.5 h-1.5 rounded-full bg-surface-2">
                  <div className={`h-1.5 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-card shadow-sm p-3">
          <h3 className="text-xs font-semibold text-ink">Agent Performance</h3>
          <div className="mt-3 space-y-2">
            {[
              { name: "Jordan D.", resolved: 42, avg: "1.8m" },
              { name: "Alex L.", resolved: 38, avg: "2.1m" },
              { name: "Katie M.", resolved: 31, avg: "2.5m" },
            ].map((a) => (
              <div key={a.name} className="flex items-center justify-between rounded-md bg-surface px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[8px] font-medium text-primary-foreground">
                    {a.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="text-[11px] text-ink">{a.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{a.resolved} resolved</span>
                  <span>{a.avg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionTitles: Record<FilterKey, string> = {
  assigned: "Assigned to me",
  mentioned: "@ Mentioned",
  all: "All",
  dashboard: "Dashboard",
};

const filterItems: { key: FilterKey; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
  { key: "assigned", label: "Assigned to me", icon: UserCheck, count: 5 },
  { key: "mentioned", label: "@ Mentioned", icon: AtSign, count: 2 },
  { key: "all", label: "All", icon: Inbox, count: 24 },
];

function SectionSidebar({
  activeFilter,
  onFilterChange,
  selectedTeam,
  onTeamChange,
}: {
  activeFilter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
  selectedTeam: string;
  onTeamChange: (team: string) => void;
}) {
  const [teamOpen, setTeamOpen] = useState(false);
  const role: "admin" | "agent" = "admin";

  const currentTeam = workspaceTeams.find((t) => t.name === selectedTeam);

  return (
    <div className="flex w-full md:w-48 shrink-0 flex-col border-r border-border">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <h2 className="text-xs font-semibold text-ink">Inbox</h2>
        <button className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-y-auto p-1.5">
        <nav className="space-y-0.5">
        {filterItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onFilterChange(item.key)}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                isActive
                  ? "bg-ink text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.count > 0 && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
            </nav>

        <button
          onClick={() => onFilterChange("dashboard")}
          className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
            activeFilter === "dashboard"
              ? "bg-ink text-primary-foreground"
              : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setTeamOpen(!teamOpen)}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">Team</span>
          {teamOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {teamOpen && (
          <div className="mt-1 space-y-0.5 pl-6">
            {role === "admin"
              ? workspaceTeams.map((team) => (
                  <div key={team.name}>
                    <button
                      onClick={() => onTeamChange(team.name)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[11px] transition-colors ${
                        selectedTeam === team.name
                          ? "bg-ink text-primary-foreground"
                          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                      }`}
                    >
                      <span className="flex-1">{team.name}</span>
                      <span className="text-[9px] text-muted-foreground">{team.members.length}</span>
                    </button>
                    {selectedTeam === team.name && (
                      <div className="ml-3 border-l border-border pl-2 pt-0.5">
                        {team.members.map((m) => (
                          <div
                            key={m.name}
                            className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-2 text-[7px] font-medium text-ink">
                              {m.initials}
                            </span>
                            <span className="truncate">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              : currentTeam && (
                  <div>
                    <div className="rounded-md px-2 py-1 text-[11px] font-medium text-ink">
                      {currentTeam.name}
                    </div>
                    <div className="ml-3 border-l border-border pl-2 pt-0.5">
                      {currentTeam.members.map((m) => (
                        <div
                          key={m.name}
                          className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface-2 text-[7px] font-medium text-ink">
                            {m.initials}
                          </span>
                          <span className="truncate">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
          </div>
        )}
      </div>
    </div>
  );
}

const statusFilters = ["Open", "Waiting", "Closed"] as const;
const sortOptions = ["Newest", "Oldest", "Urgent"] as const;

function ConversationList({
  activeFilter,
  conversations: convos,
  activeId,
  onSelect,
}: {
  activeFilter: FilterKey;
  conversations: Conversation[];
  activeId: number;
  onSelect: (c: Conversation) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<string>("Open");
  const [sortBy, setSortBy] = useState<string>("Newest");

  return (
    <div className="flex w-full md:w-72 shrink-0 flex-col border-r border-border">
      <div className="px-3 py-2.5">
        <h2 className="text-xs font-semibold text-ink">{sectionTitles[activeFilter]}</h2>
      </div>

      <div className="border-t border-border" />

      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-md border border-border bg-surface pl-2 pr-5 py-1 text-[10px] text-ink outline-none cursor-pointer"
          >
            {statusFilters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none rounded-md border border-border bg-surface pl-2 pr-5 py-1 text-[10px] text-ink outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-xs text-ink outline-none placeholder:text-muted-foreground focus:border-ink"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {convos.map((c) => {
          const statusStyles: Record<string, string> = {
            urgent: "bg-red-100 text-red-700",
            open: "bg-accent/20 text-accent-foreground",
            pending: "bg-amber-100 text-amber-700",
            closed: "bg-surface-2 text-muted-foreground",
          };
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`flex w-full gap-2.5 border-b border-border px-3 py-2.5 text-left transition-colors hover:bg-surface ${
                activeId === c.id ? "bg-surface" : ""
              }`}
            >
              <div className="relative mt-0.5 h-8 w-8 shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium text-white ${c.color}`}
                >
                  {c.avatar}
                </div>
                <StatusDot online={c.online} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-ink">{c.name}</span>
                  <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-medium ${
                    c.channel === "chat"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-surface-2 text-muted-foreground"
                  }`}>
                    {c.channel === "chat" ? "Chat" : "Email"}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{c.preview}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`rounded px-1 py-0.5 text-[9px] font-medium ${statusStyles[c.status] || statusStyles.open}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
              </div>
              {c.unread && <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatPanel({
  conversation,
  messages: msgs,
}: {
  conversation: Conversation;
  messages: typeof messageData;
}) {
  const [mode, setMode] = useState<"reply" | "note">("reply");

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium text-white ${conversation.color}`}
          >
            {conversation.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-ink">{conversation.name}</span>
              <span className="text-[10px] text-muted-foreground">via {conversation.channel}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{conversation.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
            <Phone className="h-3.5 w-3.5" />
          </button>
          <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
            <Mail className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="relative">
            <select
              value={conversation.assignee || ""}
              onChange={() => {}}
              className="appearance-none rounded-md border border-border bg-surface pl-2 pr-5 py-1 text-[10px] text-ink outline-none cursor-pointer"
            >
              <option value="" disabled>Assign</option>
              {workspaceTeams.flatMap((t) => t.members).map((m) => (
                <option key={m.name} value={m.initials}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="relative">
            <select
              value={conversation.status}
              onChange={() => {}}
              className="appearance-none rounded-md border border-border bg-surface pl-2 pr-5 py-1 text-[10px] text-ink outline-none cursor-pointer"
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "agent" && !m.isInternal ? "justify-end" : ""}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 ${
                m.isInternal
                  ? "rounded-bl-sm border border-dashed border-amber-300 bg-amber-50/50"
                  : m.from === "agent"
                    ? "bg-ink text-primary-foreground"
                    : "bg-surface"
              }`}
            >
              {m.isInternal && (
                <div className="mb-1 flex items-center gap-1 text-[9px] font-medium text-amber-600">
                  <span className="rounded bg-amber-200 px-1 py-0.5 text-[8px] uppercase">Internal</span>
                  Note from {m.name}
                </div>
              )}
              <p className="text-xs leading-relaxed">{m.text}</p>
              <div
                className={`mt-0.5 flex items-center justify-end gap-1 text-[9px] ${
                  m.isInternal
                    ? "text-amber-500"
                    : m.from === "agent"
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                }`}
              >
                {m.from === "agent" && !m.isInternal && m.seen && (
                  <span className="font-medium">Seen</span>
                )}
                <span>{m.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-2 pb-2">
        <div className="flex items-center gap-1 pl-2">
          <button
            onClick={() => setMode("reply")}
            className={`flex items-center gap-1 rounded-t-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
              mode === "reply"
                ? "border border-border border-b-0 bg-surface text-ink"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3 w-3" />
            Reply
          </button>
          <button
            onClick={() => setMode("note")}
            className={`flex items-center gap-1 rounded-t-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
              mode === "note"
                ? "border border-amber-300 border-b-0 bg-amber-50/50 text-amber-800"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenLine className="h-3 w-3" />
            Note
          </button>
        </div>
        <div className={`flex flex-col rounded-lg border ${
          mode === "note"
            ? "border-dashed border-amber-300 bg-amber-50/50"
            : "border-border bg-surface"
        }`}>
          <div className="flex flex-col gap-1.5 p-2.5">
            <textarea
              placeholder={mode === "reply" ? "Type your message..." : "Write an internal note..."}
              rows={2}
              className="min-h-[32px] resize-none bg-transparent px-2 py-1 text-xs text-ink outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <button className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
                <button className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
                  <Paperclip className="h-3.5 w-3.5" />
                </button>
                <button className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
                  <Smile className="h-3.5 w-3.5" />
                </button>
              </div>
              <button className="flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-[10px] font-medium text-primary-foreground transition-colors hover:bg-ink/90">
                <Send className="h-3.5 w-3.5" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {title}
      </button>
      {open && <div className="px-3 pb-2">{children}</div>}
    </div>
  );
}

function UserDetailsPanel({ conversation }: { conversation: Conversation }) {
  const [tab, setTab] = useState<"details" | "copilot">("details");

  return (
    <div className="flex w-full md:w-60 shrink-0 flex-col border-l border-border">
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("details")}
          className={`flex-1 py-2 text-center text-[10px] font-semibold transition-colors ${
            tab === "details"
              ? "border-b-2 border-ink text-ink"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setTab("copilot")}
          className={`flex-1 py-2 text-center text-[10px] font-semibold transition-colors ${
            tab === "copilot"
              ? "border-b-2 border-ink text-ink"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Copilot
        </button>
      </div>

      {tab === "copilot" ? (
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="rounded-lg bg-surface p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Bot className="h-3 w-3 text-accent-foreground" />
                <span className="text-[9px] font-semibold text-accent-foreground">Copilot</span>
              </div>
              <p className="text-[10px] leading-relaxed text-ink">Hi! I can help you analyze this conversation. What would you like to know?</p>
            </div>

            {[
              { q: "Summarize this conversation", delay: "1m ago" },
              { q: "Find related conversations", delay: "45s ago" },
            ].map((item) => (
              <button
                key={item.q}
                className="w-full rounded-lg border border-border bg-card p-2 text-left text-[10px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                {item.q}
              </button>
            ))}

            <div className="rounded-lg bg-ink p-2.5">
              <p className="text-[10px] leading-relaxed text-primary-foreground">
                Customer is hitting API rate limits on the Growth plan. Agent offered a temporary increase to 5000 req/hr and suggested upgrading to Enterprise. Key concerns: production deployment stability, cost of upgrade.
              </p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[8px] text-primary-foreground/60">
                <CheckCheck className="h-2.5 w-2.5" />
                <span>Just now</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1.5">
              <input
                type="text"
                placeholder="Ask Copilot..."
                className="min-w-0 flex-1 bg-transparent text-[10px] text-ink outline-none placeholder:text-muted-foreground"
              />
              <button className="rounded-md bg-ink p-1 text-primary-foreground">
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center border-b border-border px-3 py-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-medium text-white ${conversation.color}`}
            >
              {conversation.avatar}
            </div>
            <h4 className="mt-2 text-xs font-semibold text-ink">{conversation.name}</h4>
            <p className="text-[10px] text-muted-foreground">{conversation.email}</p>
            <div className="mt-2 flex gap-1">
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[9px] font-medium text-accent-foreground">
                Customer
              </span>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                VIP
              </span>
            </div>
          </div>

          <div className="border-b border-border px-3 py-2">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Details</h5>
            <div className="mt-1.5 space-y-1.5">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-muted-foreground">Assignee</span>
                <span className="flex items-center gap-1 ml-auto text-ink">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[7px] font-medium text-primary-foreground">
                    JD
                  </span>
                  Jordan Diaz
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-muted-foreground">Team</span>
                <span className="ml-auto text-ink">Support</span>
              </div>
            </div>
          </div>

          <CollapsibleSection title="Links">
            <div className="space-y-1">
              {["Tracker Tickets", "Back-Office tickets", "Side Conversations"].map((link) => (
                <div key={link} className="flex items-center justify-between rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-2">
                  <span>{link}</span>
                  <button className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Conversation Attributes">
            <div className="space-y-1">
              {[
                { label: "Id", value: "#1423" },
                { label: "Brand", value: "Connect" },
                { label: "Subject", value: "API Rate Limit" },
                { label: "Language", value: "English" },
                { label: "Topic", value: "Technical" },
                { label: "Priority", value: "High" },
                { label: "Product Area", value: "API" },
                { label: "Tag Id", value: "TAG-042" },
              ].map((attr) => (
                <div key={attr.label} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{attr.label}</span>
                  <span className="text-ink">{attr.value}</span>
                </div>
              ))}
              <button className="mt-1 text-[9px] font-medium text-accent-foreground hover:underline">See All</button>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Company Details">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Name</span>
                <span className="text-ink">Acme Corp</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-ink">Growth</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Role</span>
                <span className="text-ink">Engineering Lead</span>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="User Notes">
            <div className="space-y-1.5">
              {[
                { note: "Prefers email communication", agent: "Jordan D.", date: "2d ago" },
                { note: "Asked about enterprise plan in previous chat", agent: "Alex L.", date: "1w ago" },
              ].map((n, i) => (
                <div key={i} className="rounded-md border border-dashed border-amber-300 bg-amber-50/50 p-2">
                  <p className="text-[10px] text-amber-800">{n.note}</p>
                  <div className="mt-1 flex items-center justify-between text-[8px] text-amber-500">
                    <span>{n.agent}</span>
                    <span>{n.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Recent Conversations">
            <div className="space-y-1">
              {[
                { topic: "Billing inquiry", date: "1 week ago", status: "Resolved" },
                { topic: "Widget customization", date: "2 weeks ago", status: "Resolved" },
              ].map((c) => (
                <div key={c.topic} className="rounded-md bg-surface p-2">
                  <div className="text-[10px] font-medium text-ink">{c.topic}</div>
                  <div className="mt-0.5 flex items-center justify-between text-[8px] text-muted-foreground">
                    <span>{c.date}</span>
                    <span className="rounded bg-surface-2 px-1 py-0.5">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="User Tags">
            <div className="flex flex-wrap gap-1">
              {["api", "rate-limiting", "priority", "enterprise"].map((t) => (
                <span
                  key={t}
                  className="rounded border border-border bg-surface px-1.5 py-0.5 text-[9px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
