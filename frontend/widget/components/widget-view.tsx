"use client";

import { useEffect, useState } from "react";
import { WidgetContactForm } from "./widget-contact-form";
import { WidgetConversationList } from "./widget-conversation-list";
import { WidgetChatScreen } from "./widget-chat-screen";

interface WidgetViewProps {
  organizationId: string;
}

type Screen = "loading" | "contact-form" | "conversation-list" | "chat";

export function WidgetView({ organizationId }: WidgetViewProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [screen, setScreen] = useState<Screen>("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen("contact-form");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      const config = (window as any).connectWidgetConfig;
      if (config?.primaryColor) {
        setPrimaryColor(config.primaryColor);
      }
    } catch (e) {}
  }, []);

  if (screen === "loading") {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: primaryColor, borderTopColor: "transparent" }}
          />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (screen === "contact-form") {
    return (
      <WidgetContactForm
        onSubmit={async (name, email) => {
          setScreen("conversation-list");
        }}
        primaryColor={primaryColor}
      />
    );
  }

  if (screen === "chat" && activeConversationId) {
    return (
      <WidgetChatScreen
        conversationId={activeConversationId}
        onBack={() => setActiveConversationId(null)}
        primaryColor={primaryColor}
      />
    );
  }

  return (
    <WidgetConversationList
      onSelectConversation={(id) => {
        setActiveConversationId(id);
        setScreen("chat");
      }}
      onNewConversation={(id) => {
        setActiveConversationId(id);
        setScreen("chat");
      }}
      primaryColor={primaryColor}
    />
  );
}
