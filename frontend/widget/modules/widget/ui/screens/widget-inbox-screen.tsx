"use client";

import { useState, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  Circle,
  CheckCircle,
  Clock,
  MessageSquare,
  ChevronRight,
  Loader2,
  Inbox,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  conversationIdAtom,
  screenAtom,
  isHistoricalConversationAtom,
  widgetConfigAtom,
  organizationIdAtom,
  contactEmailAtomFamily,
} from "../../atoms/widget-atoms";
import { Button } from "@connect/ui/components/button";
import { fetchConversations, type ConversationListItem } from "../../../../lib/widget-api";

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "resolved":
    case "closed":
      return <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />;
    case "open":
      return <Circle className="h-3 w-3 text-blue-500 shrink-0" />;
    default:
      return <Clock className="h-3 w-3 text-muted-foreground shrink-0" />;
  }
};

interface Props {
  mode?: "preview" | "production";
}

export const WidgetInboxScreen = ({
  mode = "production",
}: Props) => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const setIsHistorical = useSetAtom(isHistoricalConversationAtom);
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const orgId = useAtomValue(organizationIdAtom);
  const contactEmail = useAtomValue(contactEmailAtomFamily(orgId || ""));

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contactEmail) {
      setLoading(false);
      return;
    }
    fetchConversations(contactEmail, orgId || undefined)
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contactEmail, orgId]);

  const handleAskQuestion = () => {
    setIsHistorical(false);
    setScreen("chat");
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-col border-b border-neutral-200 px-4 pt-4 pb-3">
        <div className="flex items-center justify-center">
          <h2 className="text-lg font-semibold text-neutral-900">Messages</h2>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  className="flex w-full items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left shadow-[0_1px_4px_rgb(0_0_0_/_0.05)] transition hover:border-neutral-300 hover:shadow-[0_6px_20px_rgb(0_0_0_/_0.08)]"
                  key={conv.id}
                  onClick={() => {
                    setConversationId(conv.id);
                    setIsHistorical(true);
                    setScreen("chat");
                  }}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${widgetConfig.primaryColor}1A` }}
                  >
                    <MessageSquare className="h-4 w-4" style={{ color: widgetConfig.primaryColor }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {conv.subject || conv.customer_name || "Support Chat"}
                        </p>
                      </div>
                      <p className="shrink-0 text-[11px] text-neutral-500">
                        {formatDistanceToNow(new Date(conv.last_message_at || conv.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-[13px] text-neutral-600">
                        {conv.last_message?.body || "No messages yet"}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusIcon status={conv.status} />
                        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                <Inbox className="h-6 w-6 text-neutral-500" />
              </div>
              <p className="mt-4 text-[34px] font-semibold leading-none text-neutral-900">No messages</p>
              <p className="mt-2 max-w-[260px] text-[16px] text-neutral-600">Messages from the team will appear here.</p>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 px-4 py-2.5">
          <Button
            className="mx-auto h-9 rounded-full border-0 px-5 text-[14px] font-medium shadow-[0_6px_18px_rgb(0_0_0_/_0.08)]"
            style={{ backgroundColor: widgetConfig.primaryColor, color: "#ffffff" }}
            onClick={handleAskQuestion}
          >
            Ask a question
          </Button>
        </div>
      </div>
    </div>
  );
};
