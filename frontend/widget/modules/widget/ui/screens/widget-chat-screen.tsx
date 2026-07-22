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
  isAiConversationAtom,
} from "../../atoms/widget-atoms";
import {
  detectIntent,
  type DetectedIntent,
} from "../../../../lib/intent-detection";
import { GreetingMessage } from "../components/greeting-message";
import { ConcernMessage } from "../components/concern-message";
import { DataCollectionForm } from "../components/data-collection-form";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-3 py-2 text-neutral-900 shadow-[0_2px_10px_rgb(0_0_0_/_0.08)]">
      <p className="mb-1 text-[10px] font-medium text-neutral-500">LIN AI</p>
      <div className="flex items-center gap-1.5 py-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500/70" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500/70" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500/70" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);

interface Props {
  mode?: "preview" | "production";
}

export const WidgetChatScreen = ({
  mode = "production",
}: Props) => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const setIsAiConversation = useSetAtom(isAiConversationAtom);
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const conversationId = useAtomValue(conversationIdAtom);

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [previewMessages, setPreviewMessages] = useState<any[]>([]);

  const [gdprStage, setGdprStage] = useState<"greeting" | "chat" | "concern" | "form" | "confirmed">("greeting");
  const [detectedIntent, setDetectedIntent] = useState<DetectedIntent | null>(null);
  const [detectedIssue, setDetectedIssue] = useState<string>("");
  const [userFirstMessage, setUserFirstMessage] = useState<string>("");
  const [isCreatingLead, setIsCreatingLead] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (previewMessages.length === 0) {
      setIsAiTyping(true);
      const timer = window.setTimeout(() => {
        setPreviewMessages([{
          _id: "init-msg",
          senderType: "ai",
          content: "Hey! 👋 How can I help you today?",
          createdAt: Date.now(),
        }]);
        setIsAiTyping(false);
      }, 2000);
      return () => window.clearTimeout(timer);
    }
  }, [previewMessages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [previewMessages, isAiTyping, gdprStage]);

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content || isSending) return;

    setInputValue("");

    if (gdprStage === "greeting") {
      setUserFirstMessage(content);
      const analysis = detectIntent(content);
      setDetectedIntent(analysis.intent);
      setDetectedIssue(analysis.detectedIssue || "");
      setGdprStage("concern");
      return;
    }

    const userMsg = {
      _id: `msg-${Date.now()}`,
      senderType: "user" as const,
      content,
      createdAt: Date.now(),
    };
    setPreviewMessages((prev) => [...prev, userMsg]);

    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      setPreviewMessages((prev) => [...prev, {
        _id: `resp-${Date.now()}`,
        senderType: "agent",
        content: "Thanks for your message! A support agent will respond shortly.",
        createdAt: Date.now(),
      }]);
    }, 1500);
  };

  const handleDataCollectionSubmit = async (data: { name: string; email: string; consentGiven: boolean }) => {
    setIsCreatingLead(true);
    setTimeout(() => {
      setGdprStage("confirmed");
      setIsCreatingLead(false);
    }, 500);
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
    setScreen("selection");
  };

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
            <p className="text-lg font-semibold text-neutral-900">Agent Support</p>
            <p className="text-[12px] leading-tight text-neutral-500">Our team can assist you</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 scroll-smooth">
        {gdprStage === "greeting" && previewMessages.length === 0 && (
          <GreetingMessage agentName="Support Team" primaryColor={widgetConfig.primaryColor} />
        )}

        {previewMessages.map((message) => (
          <div
            key={message._id}
            className={`flex gap-2 ${message.senderType === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] ${
                message.senderType === "user"
                  ? "text-white"
                  : "bg-neutral-100 text-neutral-900"
              }`}
              style={message.senderType === "user" ? { backgroundColor: widgetConfig.primaryColor } : undefined}
            >
              {message.senderType === "ai" && (
                <p className="mb-1 text-[10px] font-medium text-neutral-500">LIN AI</p>
              )}
              {message.senderType === "agent" && (
                <p className="mb-1 text-[10px] font-medium text-neutral-500">Agent</p>
              )}
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <p className="mt-1 text-[9px] text-neutral-500">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
              <p className="mb-1 text-[10px] font-medium text-neutral-500">LIN AI</p>
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

        {isAiTyping && <TypingIndicator />}
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
