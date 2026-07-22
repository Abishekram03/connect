"use client";

import { useState } from "react";
import { Button } from "@connect/ui/components/button";
import { Icon } from "@iconify/react";
import { ListChecks, X } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
  widgetConfigAtom,
  isAiConversationAtom,
} from "../../atoms/widget-atoms";

interface Props {
  mode?: "preview" | "production";
  onClose?: () => void;
}

export const WidgetSelectionScreen = ({
  mode = "production",
  onClose,
}: Props = {}) => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const setIsAiConversation = useSetAtom(isAiConversationAtom);
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const [isPending, setIsPending] = useState<"chat" | null>(null);

  const faqs: { id: string; question: string; answer: string }[] = [];

  const handleStartChat = () => {
    setIsPending("chat");
    setConversationId(`conv-${Date.now()}`);
    setIsAiConversation(true);
    setScreen("chat");
    setIsPending(null);
  };

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[85%]"
        style={{
          background: `linear-gradient(180deg, ${widgetConfig.primaryColor}EE 0%, ${widgetConfig.primaryColor}CC 40%, ${widgetConfig.primaryColor}66 70%, rgba(255,255,255,0) 100%)`,
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pb-5 pt-5">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm" style={{ backgroundColor: widgetConfig.primaryColor }}>
            C
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors mt-0.5"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="mt-8 mb-5">
          <p className="text-[32px] font-semibold leading-[1.05] tracking-[-0.02em] text-neutral-800">
            {widgetConfig.welcomeHeading}
          </p>
          <p className="mt-1 text-[30px] font-semibold leading-[1.02] tracking-[-0.02em] text-neutral-900">
            {widgetConfig.welcomeSubheading}
          </p>
        </div>

        <Button
          className="mb-4 h-[86px] w-full justify-between rounded-2xl border border-neutral-200 bg-white px-4 text-left shadow-[0_2px_8px_rgb(0_0_0_/_0.08)]"
          variant="outline"
          onClick={handleStartChat}
          disabled={isPending !== null}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-lg font-bold">
              AI
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className="truncate text-[15px] font-semibold"
                style={{ color: widgetConfig.primaryColor }}
              >
                {isPending === "chat" ? "Starting..." : "Start a conversation"}
              </span>
              <span className="truncate text-[13px] text-neutral-500">
                Our team can also help you
              </span>
            </div>
          </div>
          <Icon
            icon="solar:arrow-right-bold"
            className="h-[18px] w-[18px] flex-shrink-0"
            style={{ color: widgetConfig.primaryColor }}
          />
        </Button>

        {widgetConfig.showFaqsOnHome && (
          <div className="mb-4 rounded-xl border border-neutral-200 bg-white/90 p-3 shadow-[0_2px_10px_rgb(0_0_0_/_0.06)]">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-neutral-500" />
                <p className="text-sm font-semibold text-neutral-900">
                  Quick answers
                </p>
              </div>
              {widgetConfig.helpCenterEnabled && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[12px]"
                  onClick={() => setScreen("help")}
                >
                  Browse help
                </Button>
              )}
            </div>

            {faqs.length === 0 ? (
              <p className="text-xs text-neutral-500">FAQs coming soon.</p>
            ) : (
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <details
                    key={faq.id}
                    className="group rounded-lg border border-neutral-100 bg-white"
                  >
                    <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-neutral-900 group-open:bg-neutral-50">
                      {faq.question}
                    </summary>
                    <div className="px-3 pb-3 text-sm text-neutral-700">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
