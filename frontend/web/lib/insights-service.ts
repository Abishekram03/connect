import { api } from "./api-client";

export interface InsightsData {
  kpis: {
    totalConversations: number;
    resolved: number;
    open: number;
    pending: number;
    avgResponseTime: number;
    avgConversationDuration: number;
    activeAgents: number;
    satisfactionScore: number | null;
  };
  trend: {
    day: string;
    conversations: number;
    resolved: number;
    avgTime: number;
  }[];
  agents: {
    name: string;
    conversations: number;
    resolved: number;
    avgTime: number;
    satisfaction: number | null;
  }[];
}

export async function fetchInsights(period: string = "7d"): Promise<InsightsData> {
  return api.get(`/api/insights/summary?period=${period}`);
}
