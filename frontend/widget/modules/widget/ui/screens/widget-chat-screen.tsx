"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { EmojiClickData } from "emoji-picker-react";
import { Button } from "@connect/ui/components/button";
import { ArrowLeftIcon, SendIcon, Loader2Icon, SmileIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  conversationIdAtom,
  screenAtom,
  widgetConfigAtom,
  organizationIdAtom,
  contactEmailAtomFamily,
  contactNameAtomFamily,
  isHistoricalConversationAtom,
} from "../../atoms/widget-atoms";
import { detectIntent } from "../../../../lib/intent-detection";
import { GreetingMessage } from "../components/greeting-message";
import { ConcernMessage } from "../components/concern-message";
import { DataCollectionForm } from "../components/data-collection-form";
import { startConversation, sendMessage, fetchMessages, type MessageResponse } from "../../../../lib/widget-api";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface Props {
  mode?: "preview" | "production";
}

export const WidgetChatScreen = ({
  mode = "production",
}: Props) => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const orgId = useAtomValue(organizationIdAtom);
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const isHistorical = useAtomValue(isHistoricalConversationAtom);
  const setContactName = useSetAtom(contactNameAtomFamily(orgId || ""));
  const setContactEmail = useSetAtom(contactEmailAtomFamily(orgId || ""));

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [initialLoading, setInitialLoading] = useState(!!conversationId);
  const lastTimestampRef = useRef<string>("");

  const [gdprStage, setGdprStage] = useState<"greeting" | "chat" | "concern" | "form" | "confirmed">(
    conversationId ? "chat" : "greeting"
  );
  const [detectedIssue, setDetectedIssue] = useState<string>("");
  const [userFirstMessage, setUserFirstMessage] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isCreatingLead, setIsCreatingLead] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const convStartedRef = useRef(false);

  // Load existing messages when viewing a past conversation
  useEffect(() => {
    if (!conversationId || !isHistorical || messages.length > 0) return;
    fetchMessages(conversationId).then((msgs) => {
      setMessages(msgs);
      if (msgs.length > 0) {
        lastTimestampRef.current = msgs[msgs.length - 1].created_at;
      }
      setInitialLoading(false);
    }).catch(() => setInitialLoading(false));
  }, [conversationId, isHistorical]);

  // Poll for new messages (agent replies from dashboard)
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  useEffect(() => {
    if (!conversationId || gdprStage !== "chat") return;

    const poll = () => {
      pollingRef.current = setTimeout(async () => {
        try {
          const cid = conversationIdRef.current;
          if (!cid) return;
          const since = lastTimestampRef.current || undefined;
          const newMsgs = await fetchMessages(cid, since);
          if (newMsgs.length > 0) {
            setMessages((prev) => {
              const existing = new Set(prev.map((m) => m.id));
              const fresh = newMsgs.filter((m) => !existing.has(m.id));
              return [...prev, ...fresh];
            });
            lastTimestampRef.current = newMsgs[newMsgs.length - 1].created_at;
          }
        } catch {}
        poll();
      }, 3000);
    };

    poll();
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [conversationId, gdprStage]);

  // Create conversation + send first message when GDPR flow completes
  useEffect(() => {
    if (gdprStage !== "chat" || convStartedRef.current || !userFirstMessage || !orgId) return;
    convStartedRef.current = true;
    startConversation(orgId, {
      customer_name: customerName || undefined,
      customer_email: customerEmail || undefined,
      subject: userFirstMessage,
    }).then(async (conv) => {
      setConversationId(conv.id);
      const msg = await sendMessage(conv.id, userFirstMessage);
      setMessages([msg]);
      lastTimestampRef.current = msg.created_at;
    });
  }, [gdprStage, orgId, userFirstMessage, customerName, customerEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, gdprStage]);

  useEffect(() => {
    if (gdprStage === "concern") {
      const timer = setTimeout(() => setGdprStage("form"), 1000);
      return () => clearTimeout(timer);
    }
  }, [gdprStage]);

  useEffect(() => {
    if (gdprStage === "confirmed") {
      const timer = setTimeout(() => setGdprStage("chat"), 2000);
      return () => clearTimeout(timer);
    }
  }, [gdprStage]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content || isSending) return;

    setInputValue("");

    if (gdprStage === "greeting") {
      setUserFirstMessage(content);
      const analysis = detectIntent(content);
      setDetectedIssue(analysis.detectedIssue || "");
      setGdprStage("concern");
      return;
    }

    if (!conversationId) return;

    setIsSending(true);
    try {
      const msg = await sendMessage(conversationId, content);
      setMessages((prev) => [...prev, msg]);
      lastTimestampRef.current = msg.created_at;
    } catch {} finally {
      setIsSending(false);
    }
  };

  const handleDataCollectionSubmit = async (data: { name: string; email: string; consentGiven: boolean }) => {
    setIsCreatingLead(true);
    try {
      setCustomerName(data.name);
      setCustomerEmail(data.email);
      if (data.name) setContactName(data.name);
      if (data.email) setContactEmail(data.email);
      setGdprStage("confirmed");
    } catch {} finally {
      setIsCreatingLead(false);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => `${prev}${emojiData.emoji}`);
    textAreaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const onBack = () => {
    setConversationId(null);
    setScreen(isHistorical ? "inbox" : "selection");
  };

  const showGreeting = gdprStage === "greeting" && messages.length === 0;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 flex-col border-b border-neutral-200 bg-white px-2 pt-4 pb-2">
        <div className="flex items-center gap-x-2">
          <button
            onClick={onBack}
            className="rounded p-0.5 text-neutral-700 transition-colors hover:bg-neutral-100"
            aria-label="Back to conversations"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
          </button>
          <div>
            <p className="text-lg font-semibold text-neutral-900">Support</p>
            <p className="text-[12px] leading-tight text-neutral-500">We typically reply in a few minutes</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 scroll-smooth">
        {initialLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader2Icon className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        )}

        {showGreeting && (
          <GreetingMessage agentName="Support Team" primaryColor={widgetConfig.primaryColor} />
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.is_from_customer ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] ${
                msg.is_from_customer
                  ? "text-white"
                  : "bg-neutral-100 text-neutral-900"
              }`}
              style={msg.is_from_customer ? { backgroundColor: widgetConfig.primaryColor } : undefined}
            >
              {!msg.is_from_customer && (
                <p className="mb-1 text-[10px] font-medium text-neutral-500">Agent</p>
              )}
              <p className="whitespace-pre-wrap break-words">{msg.body}</p>
              <p className="mt-1 text-[9px] text-neutral-500">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {gdprStage === "concern" && (
          <ConcernMessage detectedIssue={detectedIssue} primaryColor={widgetConfig.primaryColor} />
        )}

        {gdprStage === "form" && (
          <div className="flex justify-start">
            <div className="w-full rounded-2xl bg-neutral-100 px-3 py-2 shadow-[0_2px_10px_rgb(0_0_0_/_0.08)]" style={{ borderRadius: 16 }}>
              <p className="mb-1 text-[10px] font-medium text-neutral-500">AI Assistant</p>
              <p className="mb-2 text-sm text-neutral-900">
                Thanks for the details — could I get your name and email so our team can follow up?
              </p>
              <div className="mt-2">
                <DataCollectionForm
                  onSubmit={handleDataCollectionSubmit}
                  primaryColor={widgetConfig.primaryColor}
                  isLoading={isCreatingLead}
                />
              </div>
            </div>
          </div>
        )}

        {gdprStage === "confirmed" && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-900 shadow-[0_2px_10px_rgb(0_0_0_/_0.08)]">
              <p className="text-[11px] font-semibold mb-2">✓ Thank you!</p>
              <p className="text-sm leading-relaxed">
                Your information has been saved. Our team will reach out to you shortly to help resolve your issue.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-neutral-200 bg-white p-3"
      >
        <div className="relative rounded-3xl border border-neutral-200 bg-white px-3 py-2 shadow-[0_6px_20px_rgb(0_0_0_/_0.08)]">
          {isEmojiPickerOpen && (
            <div className="absolute bottom-full right-0 z-20 mb-2 w-[min(92vw,280px)] max-w-[280px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_12px_28px_rgb(0_0_0_/_0.16)]">
              <div className="max-h-[320px] overflow-y-auto overflow-x-hidden">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  searchDisabled={false}
                  lazyLoadEmojis={true}
                  skinTonesDisabled={false}
                  width="100%"
                  height={320}
                />
              </div>
            </div>
          )}

          <textarea
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={isSending}
            className="h-9 w-full resize-none bg-transparent px-1 py-1 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            rows={1}
          />

          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              className="rounded-full p-1 text-neutral-500 transition-colors hover:text-neutral-700"
              aria-label="Open emoji selector"
              onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
            >
              <SmileIcon className="h-5 w-5" />
            </button>

            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full border-0"
              style={{ backgroundColor: widgetConfig.primaryColor, color: "#ffffff" }}
              disabled={!inputValue.trim() || isSending}
            >
              {isSending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
