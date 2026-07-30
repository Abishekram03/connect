"use client";

import { Button } from "@connect/ui/components/button";

interface WidgetConversationListProps {
  sessionToken?: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: (id: string) => void;
  primaryColor?: string;
}

const MOCK_CONVERSATIONS: { _id: string; contactName: string; lastMessage: string; status: string }[] = [];

export function WidgetConversationList({
  sessionToken,
  onSelectConversation,
  onNewConversation,
  primaryColor = "#2563eb",
}: WidgetConversationListProps) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b px-4 py-3 text-center">
        <h2 className="font-semibold">Your Conversations</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {MOCK_CONVERSATIONS.map((conv) => (
          <button
            key={conv._id}
            onClick={() => onSelectConversation(conv._id)}
            className="w-full border-b px-4 py-3 text-left hover:bg-gray-50"
          >
            <p className="text-sm font-semibold">{conv.contactName}</p>
            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
          </button>
        ))}
      </div>

      <div className="border-t p-3">
        <Button
          className="w-full rounded-full"
          style={{ backgroundColor: primaryColor, color: "#fff" }}
          onClick={() => onNewConversation(`new-${Date.now()}`)}
        >
          New Conversation
        </Button>
      </div>
    </div>
  );
}
