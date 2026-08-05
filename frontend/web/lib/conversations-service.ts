import { api } from "./api-client";

export interface Team {
  id: string;
  name: string;
  description: string;
}

export interface Conversation {
  id: string;
  ticket_id: number;
  status: "open" | "pending" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  channel: "widget" | "email" | "api";
  subject: string;
  customer_name: string;
  customer_email: string;
  customer_avatar: string;
  assignee: { id: string; email: string; name: string } | null;
  team: Team | null;
  last_message: { id: string; body: string; created_at: string; is_from_customer: boolean } | null;
  message_count: number;
  assigned_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  sla_deadline: string | null;
  sla_breached: boolean;
  sla_status: "on_track" | "warning" | "breached" | "none";
  sla_time_remaining: number | null;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  type: "reply" | "note" | "system";
  body: string;
  original_body: string;
  detected_language: string;
  sender: string | null;
  sender_name: string;
  is_from_customer: boolean;
  read_at: string | null;
  created_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
  browser: Record<string, string>;
  location: string;
}

export interface Agent {
  id: string;
  email: string;
  name: string;
}

export async function fetchConversations(params?: {
  status?: string;
  assignee?: string;
  customer_email?: string;
  page?: number;
}): Promise<{ results: Conversation[]; total: number; page: number }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.assignee) searchParams.set("assignee", params.assignee);
  if (params?.customer_email) searchParams.set("customer_email", params.customer_email);
  if (params?.page) searchParams.set("page", String(params.page));
  const qs = searchParams.toString();
  return api.get(`/api/conversations${qs ? `?${qs}` : ""}`);
}

export async function fetchConversation(id: string): Promise<ConversationDetail> {
  return api.get(`/api/conversations/${id}`);
}

export async function sendMessage(
  conversationId: string,
  body: string,
  type: "reply" | "note" = "reply"
): Promise<Message> {
  return api.post(`/api/conversations/${conversationId}/messages`, { body, type });
}

export async function updateConversation(
  conversationId: string,
  data: { status?: string; priority?: string }
): Promise<ConversationDetail> {
  return api.patch(`/api/conversations/${conversationId}`, data);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  return api.delete(`/api/conversations/${conversationId}`);
}

export async function assignConversation(
  conversationId: string,
  assigneeId?: string,
  teamId?: string
): Promise<ConversationDetail> {
  return api.post(`/api/conversations/${conversationId}/assign`, {
    assignee_id: assigneeId,
    team_id: teamId,
  });
}

export async function fetchAgents(): Promise<Agent[]> {
  return api.get("/api/agents");
}

export async function fetchTeamsList(): Promise<Team[]> {
  return api.get("/api/teams-list");
}

export async function fetchPastConversations(customerEmail: string, currentId: string): Promise<Conversation[]> {
  const res = await fetchConversations({ customer_email: customerEmail });
  return res.results.filter((c) => c.id !== currentId);
}
