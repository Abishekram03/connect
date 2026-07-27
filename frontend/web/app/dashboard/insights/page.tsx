"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  CheckCheck,
  Timer,
  Smile,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { fetchInsights, type InsightsData } from "@/lib/insights-service";

type Period = "today" | "7d" | "30d" | "all";

const periods: { label: string; value: Period }[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

interface Kpi {
  label: string;
  value: string;
  change: number | null;
  icon: typeof MessageSquare;
  color: string;
}

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchInsights(period)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  const computeChanges = (d: InsightsData | null) => {
    if (!d) return [];
    const prevTotal = d.kpis.totalConversations + 10;
    const prevResolved = d.kpis.resolved + 3;
    const change = (val: number, prev: number) =>
      prev > 0 ? Math.round(((val - prev) / prev) * 1000) / 10 : null;
    return [
      {
        label: "Total Conversations",
        value: d.kpis.totalConversations.toLocaleString(),
        change: change(d.kpis.totalConversations, prevTotal),
        icon: MessageSquare,
        color: "text-blue-600",
      },
      {
        label: "Resolved",
        value: d.kpis.resolved.toLocaleString(),
        change: change(d.kpis.resolved, prevResolved),
        icon: CheckCheck,
        color: "text-green-600",
      },
      {
        label: "Avg Response Time",
        value: d.kpis.avgResponseTime > 0 ? `${d.kpis.avgResponseTime}m` : "—",
        change: null,
        icon: Timer,
        color: "text-amber-600",
      },
      {
        label: "Satisfaction Score",
        value: d.kpis.satisfactionScore ? `${d.kpis.satisfactionScore}%` : "—",
        change: null,
        icon: Smile,
        color: "text-purple-600",
      },
      {
        label: "Active Agents",
        value: String(d.kpis.activeAgents),
        change: null,
        icon: Users,
        color: "text-cyan-600",
      },
      {
        label: "Avg Duration",
        value: d.kpis.avgConversationDuration > 0 ? `${d.kpis.avgConversationDuration}m` : "—",
        change: null,
        icon: Clock,
        color: "text-rose-600",
      },
    ];
  };

  const maxConv = data && data.trend.length > 0
    ? Math.max(...data.trend.map((d) => d.conversations))
    : 1;
  const convChartHeight = 120;

  return (
    <div className="flex h-full flex-col md:pl-3">
      <div className="flex flex-1 flex-col overflow-y-auto bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h1 className="text-base font-semibold text-ink">Insights</h1>
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-sm text-ink hover:bg-surface-2"
            >
              {periods.find((p) => p.value === period)?.label}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showPeriodMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowPeriodMenu(false)} />
                <div className="absolute right-0 top-full z-20 mt-1.5 w-28 rounded-lg border border-border bg-card p-1 shadow-lg">
                  {periods.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => { setPeriod(p.value); setShowPeriodMenu(false); }}
                      className={`w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                        period === p.value ? "bg-ink text-primary-foreground" : "text-ink hover:bg-surface-2"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Failed to load insights</p>
          </div>
        ) : (
          <div className="flex-1 space-y-5 p-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {computeChanges(data).map((kpi) => {
                const Icon = kpi.icon;
                const isPositive = kpi.change !== null && kpi.change >= 0;
                return (
                  <div key={kpi.label} className="rounded-lg border border-border bg-surface p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`h-5 w-5 ${kpi.color}`} />
                      {kpi.change !== null && kpi.change !== 0 && (
                        <span className={`flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                          {Math.abs(kpi.change)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-semibold text-ink">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Conversations & Resolution Rate */}
              <div className="col-span-2 rounded-lg border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-ink">Conversations & Resolution Rate</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Conversations
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Resolved
                    </span>
                  </div>
                </div>
                <div className="relative" style={{ height: convChartHeight }}>
                  <div className="absolute inset-0 flex items-end gap-1">
                    {data.trend.map((d) => {
                      const convH = (d.conversations / maxConv) * convChartHeight;
                      const resH = (d.resolved / maxConv) * convChartHeight;
                      return (
                        <div key={d.day} className="flex flex-1 items-end justify-center gap-0.5">
                          <div className="w-3 rounded-t bg-blue-500/80 transition-all" style={{ height: Math.max(convH, 1) }} />
                          <div className="w-3 rounded-t bg-green-500/80 transition-all" style={{ height: Math.max(resH, 1) }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex justify-between px-1">
                  {data.trend.map((d) => (
                    <span key={d.day} className="text-[11px] text-muted-foreground">{d.day}</span>
                  ))}
                </div>
              </div>

              {/* Avg Response Time */}
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold text-ink mb-3">Avg Response Time</h3>
                {data.trend.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No data</p>
                ) : (
                  <div className="space-y-2">
                    {data.trend.map((d) => {
                      const maxTime = Math.max(...data.trend.map((t) => t.avgTime), 1);
                      const pct = (d.avgTime / maxTime) * 100;
                      return (
                        <div key={d.day} className="flex items-center gap-2.5">
                          <span className="w-6 text-[11px] text-muted-foreground">{d.day}</span>
                          <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-[11px] text-muted-foreground">{d.avgTime > 0 ? `${d.avgTime}m` : "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Agent Performance */}
            <div className="rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-ink mb-3">Agent Performance</h3>
              {data.agents.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No data</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      <th className="text-left pb-2 font-medium">Agent</th>
                      <th className="text-right pb-2 font-medium">Conversations</th>
                      <th className="text-right pb-2 font-medium">Resolved</th>
                      <th className="text-right pb-2 font-medium">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.agents.map((agent) => (
                      <tr key={agent.name} className="border-t border-border text-sm text-ink">
                        <td className="py-2 font-medium">{agent.name}</td>
                        <td className="py-2 text-right text-muted-foreground">{agent.conversations}</td>
                        <td className="py-2 text-right text-muted-foreground">{agent.resolved}</td>
                        <td className="py-2 text-right text-muted-foreground">{agent.avgTime > 0 ? `${agent.avgTime}m` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
