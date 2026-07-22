"use client";

import { useState, useRef, useEffect } from "react";

interface WidgetChatScreenProps {
  sessionToken?: string;
  conversationId: string;
  onBack: () => void;
  primaryColor?: string;
}

export function WidgetChatScreen({
  sessionToken,
  conversationId,
  onBack,
  primaryColor = "#2563eb",
}: WidgetChatScreenProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<any[]>([
    {
      _id: "welcome",
      senderType: "agent",
      content: "Hi! How can I help you today?",
      createdAt: Date.now(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    setMessages((prev) => [
      ...prev,
      { _id: `user-${Date.now()}`, senderType: "user", content, createdAt: Date.now() },
    ]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          _id: `agent-${Date.now()}`,
          senderType: "agent",
          content: "Thanks for your message! A team member will get back to you soon.",
          createdAt: Date.now(),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back</button>
        <span className="font-semibold text-sm">Support Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg._id} className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.senderType === "user"
                  ? "text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
              style={msg.senderType === "user" ? { backgroundColor: primaryColor } : {}}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:ring-2"
            style={{ borderColor: primaryColor }}
          />
          <button
            type="submit"
            className="rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
