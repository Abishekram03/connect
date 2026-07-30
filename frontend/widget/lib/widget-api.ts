const API_BASE = "http://127.0.0.1:8000";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface WidgetConfigResponse {
  organizationId: string;
  organizationName: string;
  primaryColor: string;
  companyName: string;
  logoUrl: string;
  position: "bottom-right" | "bottom-left";
  borderRadius: number;
  showBranding: boolean;
  autoGreet: boolean;
  autoGreetDelay: number;
  collectEmail: boolean;
  helpCenterEnabled: boolean;
}

export interface ConversationResponse {
  id: string;
  created_at: string;
}

export interface MessageResponse {
  id: string;
  type: string;
  body: string;
  sender: string | null;
  sender_name: string;
  is_from_customer: boolean;
  read_at: string | null;
  created_at: string;
}

export function fetchWidgetConfig(organizationId: string): Promise<WidgetConfigResponse> {
  return api(`/api/widget/config?organization_id=${encodeURIComponent(organizationId)}`);
}

export function startConversation(organizationId: string, data?: {
  customer_name?: string;
  customer_email?: string;
  subject?: string;
}): Promise<ConversationResponse> {
  return api("/api/widget/conversations", {
    method: "POST",
    body: JSON.stringify({ organization_id: organizationId, ...data }),
  });
}

export interface ConversationListItem {
  id: string;
  status: string;
  priority: string;
  subject: string;
  customer_name: string;
  customer_email: string;
  last_message: { id: string; body: string; created_at: string; is_from_customer: boolean } | null;
  message_count: number;
  last_message_at: string;
  created_at: string;
}

export function fetchConversations(email: string, orgId?: string): Promise<ConversationListItem[]> {
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  if (orgId) params.set("organization_id", orgId);
  return api(`/api/widget/conversations?${params.toString()}`);
}

export function sendMessage(conversationId: string, body: string): Promise<MessageResponse> {
  return api(`/api/widget/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function fetchMessages(conversationId: string, since?: string): Promise<MessageResponse[]> {
  const params = since ? `?since=${encodeURIComponent(since)}` : "";
  return api(`/api/widget/conversations/${conversationId}/messages${params}`);
}
