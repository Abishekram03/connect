"use client";

import { useState } from "react";
import { Button } from "@connect/ui/components/button";
import { Icon } from "@iconify/react";
import { X, Inbox } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  organizationIdAtom,
  screenAtom,
  widgetConfigAtom,
  isAiConversationAtom,
  contactEmailAtomFamily,
} from "../../atoms/widget-atoms";
import { BrandLogo } from "../components/brand-logo";

interface Props {
  mode?: "preview" | "production";
  onClose?: () => void;
}

export const WidgetSelectionScreen = ({
  mode = "production",
  onClose,
}: Props = {}) => {
  const setScreen = useSetAtom(screenAtom);
  const setIsAiConversation = useSetAtom(isAiConversationAtom);
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const storedEmail = useAtomValue(contactEmailAtomFamily(organizationId || ""));
  const [isPending, setIsPending] = useState<"chat" | null>(null);

  const handleStartChat = () => {
    setIsPending("chat");
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
          <BrandLogo size={40} />
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

        {organizationId && (
          <Button
            className="mb-4 h-[86px] w-full justify-between rounded-2xl border border-neutral-200 bg-white/90 px-4 text-left shadow-[0_2px_8px_rgb(0_0_0_/_0.08)]"
            variant="outline"
            onClick={() => setScreen("inbox")}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <Inbox className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[15px] font-semibold text-neutral-800">
                  My Messages
                </span>
                <span className="truncate text-[13px] text-neutral-500">
                  View your past conversations
                </span>
              </div>
            </div>
            <Icon
              icon="solar:arrow-right-bold"
              className="h-[18px] w-[18px] flex-shrink-0 text-neutral-400"
            />
          </Button>
        )}
      </div>
    </div>
  );
};
