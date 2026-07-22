"use client";

import { useState } from "react";
import {
  MessageSquare,
  CheckCheck,
  Timer,
  Smile,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from "lucide-react";

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
  change: number;
  icon: typeof MessageSquare;
  color: string;
}

const kpis: Kpi[] = [
  { label: "Total Conversations", value: "1,284", change: 12.5, icon: MessageSquare, color: "text-blue-600" },
  { label: "Resolved", value: "1,021", change: 8.3, icon: CheckCheck, color: "text-green-600" },
  { label: "Avg Response Time", value: "2.4m", change: -15.2, icon: Timer, color: "text-amber-600" },
  { label: "Satisfaction Score", value: "94%", change: 3.1, icon: Smile, color: "text-purple-600" },
  { label: "Active Agents", value: "8", change: 0, icon: Users, color: "text-cyan-600" },
  { label: "Avg Conversation Duration", value: "8.2m", change: -5.7, icon: Clock, color: "text-rose-600" },
];

const weeklyData = [
  { day: "Mon", conversations: 42, resolved: 38, avgTime: 2.1 },
  { day: "Tue", conversations: 56, resolved: 49, avgTime: 1.8 },
  { day: "Wed", conversations: 48, resolved: 42, avgTime: 2.3 },
  { day: "Thu", conversations: 63, resolved: 55, avgTime: 1.9 },
  { day: "Fri", conversations: 52, resolved: 47, avgTime: 2.5 },
  { day: "Sat", conversations: 28, resolved: 25, avgTime: 3.1 },
  { day: "Sun", conversations: 31, resolved: 27, avgTime: 2.8 },
];

const teamPerformance = [
  { name: "Support", conversations: 412, resolved: 378, avgTime: 2.1, satisfaction: 96 },
  { name: "Sales", conversations: 289, resolved: 245, avgTime: 1.8, satisfaction: 92 },
  { name: "Billing", conversations: 156, resolved: 142, avgTime: 3.2, satisfaction: 88 },
  { name: "Engineering", conversations: 98, resolved: 85, avgTime: 4.5, satisfaction: 90 },
];

const topTopics = [
  { topic: "Account Access", count: 215, trend: "up" as const },
  { topic: "Billing Issue", count: 178, trend: "down" as const },
  { topic: "Feature Request", count: 142, trend: "up" as const },
  { topic: "Bug Report", count: 98, trend: "down" as const },
  { topic: "Integration Help", count: 67, trend: "up" as const },
];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const maxConv = Math.max(...weeklyData.map((d) => d.conversations));
  const convChartHeight = 120;

  return (
    <div className="flex h-full flex-col p-0 md:pl-3 md:pt-3">
      <div className="flex flex-1 flex-col overflow-y-auto rounded-none md:rounded-tl-lg bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h1 className="text-sm font-semibold text-ink">Insights</h1>
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-ink hover:bg-surface-2"
            >
              {periods.find((p) => p.value === period)?.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showPeriodMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowPeriodMenu(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-28 rounded-lg border border-border bg-card p-1 shadow-lg">
                  {periods.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => { setPeriod(p.value); setShowPeriodMenu(false); }}
                      className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
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

        <div className="flex-1 space-y-4 p-4">
          <div className="grid grid-cols-6 gap-3">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              const isPositive = kpi.change >= 0;
              return (
                <div key={kpi.label} className="rounded-lg border border-border bg-surface p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                    {kpi.change !== 0 && (
                      <span className={`flex items-center gap-0.5 text-[9px] font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                        {Math.abs(kpi.change)}%
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-ink">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-ink">Conversations & Resolution Rate</h3>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
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
                  {weeklyData.map((d) => {
                    const convH = (d.conversations / maxConv) * convChartHeight;
                    const resH = (d.resolved / maxConv) * convChartHeight;
                    return (
                      <div key={d.day} className="flex flex-1 items-end justify-center gap-0.5">
                        <div className="w-3 rounded-t bg-blue-500/80 transition-all" style={{ height: convH }} />
                        <div className="w-3 rounded-t bg-green-500/80 transition-all" style={{ height: resH }} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 flex justify-between px-1">
                {weeklyData.map((d) => (
                  <span key={d.day} className="text-[9px] text-muted-foreground">{d.day}</span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-xs font-semibold text-ink mb-3">Avg Response Time</h3>
              <div className="space-y-2">
                {weeklyData.map((d) => {
                  const pct = (d.avgTime / 4) * 100;
                  return (
                    <div key={d.day} className="flex items-center gap-2">
                      <span className="w-6 text-[9px] text-muted-foreground">{d.day}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-7 text-right text-[9px] text-muted-foreground">{d.avgTime}m</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-xs font-semibold text-ink mb-3">Team Performance</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] text-muted-foreground uppercase tracking-wider">
                    <th className="text-left pb-2 font-medium">Team</th>
                    <th className="text-right pb-2 font-medium">Conv</th>
                    <th className="text-right pb-2 font-medium">Resolved</th>
                    <th className="text-right pb-2 font-medium">Avg Time</th>
                    <th className="text-right pb-2 font-medium">Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((team) => (
                    <tr key={team.name} className="border-t border-border text-xs text-ink">
                      <td className="py-2 font-medium">{team.name}</td>
                      <td className="py-2 text-right text-muted-foreground">{team.conversations}</td>
                      <td className="py-2 text-right text-muted-foreground">{team.resolved}</td>
                      <td className="py-2 text-right text-muted-foreground">{team.avgTime}m</td>
                      <td className="py-2 text-right">
                        <span className="text-green-600">{team.satisfaction}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="text-xs font-semibold text-ink mb-3">Top Topics</h3>
              <div className="space-y-2">
                {topTopics.map((topic) => {
                  const maxCount = topTopics[0].count;
                  const barW = (topic.count / maxCount) * 100;
                  return (
                    <div key={topic.topic} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-ink truncate">{topic.topic}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{topic.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${barW}%` }} />
                        </div>
                      </div>
                      {topic.trend === "up" ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
