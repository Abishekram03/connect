"use client";

import { useEffect } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { WidgetFooter } from "../components/widget-footer";
import {
  footerVisibleAtom,
  organizationIdAtom,
  screenAtom,
  widgetConfigAtom,
} from "../../atoms/widget-atoms";
import { WidgetErrorScreen } from "../screens/widget-error-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";
import { WidgetSelectionScreen } from "../screens/widget-selection-screen";
import { WidgetChatScreen } from "../screens/widget-chat-screen";
import { WidgetInboxScreen } from "../screens/widget-inbox-screen";
import { WidgetHelpScreen } from "../screens/widget-help-screen";
import { fetchWidgetConfig } from "../../../../lib/widget-api";

interface Props {
  organizationId: string;
  mode?: "preview" | "production";
  onClose?: () => void;
}

export const WidgetView = ({ organizationId, mode = "production", onClose }: Props) => {
  const screen = useAtomValue(screenAtom);
  const setWidgetConfig = useSetAtom(widgetConfigAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const setScreen = useSetAtom(screenAtom);
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const footerVisible = useAtomValue(footerVisibleAtom);

  useEffect(() => {
    if (organizationId) {
      setOrganizationId(organizationId);
    }
    setScreen("selection");
  }, [organizationId, setOrganizationId, setScreen]);

  // Fetch widget config from API
  useEffect(() => {
    if (!organizationId) return;
    fetchWidgetConfig(organizationId).then((cfg) => {
      setWidgetConfig((prev) => ({
        ...prev,
        primaryColor: cfg.primaryColor,
        companyName: cfg.companyName,
        logoUrl: cfg.logoUrl,
        position: cfg.position,
        borderRadius: cfg.borderRadius,
        showBranding: cfg.showBranding,
        autoGreet: cfg.autoGreet,
        autoGreetDelay: cfg.autoGreetDelay,
        collectEmail: cfg.collectEmail,
        helpCenterEnabled: cfg.helpCenterEnabled,
      }));
    }).catch(() => {});
  }, [organizationId, setWidgetConfig]);

  // Listen for config from parent (widget.js or dashboard preview)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      if (
        (type === "connect:config" || type === "connect:config-update") &&
        payload
      ) {
        console.log("[Widget] Received config update:", payload);
        setWidgetConfig((prev) => ({ ...prev, ...payload }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setWidgetConfig]);

  // Send config to parent (for launcher styling)
  useEffect(() => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "connect:launcher-config",
          payload: {
            primaryColor: widgetConfig.primaryColor,
            position: widgetConfig.position,
            borderRadius: widgetConfig.borderRadius,
          },
        },
        "*",
      );
    }
  }, [
    widgetConfig.primaryColor,
    widgetConfig.position,
    widgetConfig.borderRadius,
  ]);

  const screenComponents: Record<string, JSX.Element> = {
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen />,
    inbox: <WidgetInboxScreen mode={mode} />,
    selection: <WidgetSelectionScreen mode={mode} onClose={onClose} />,
    chat: <WidgetChatScreen mode={mode} />,
    help: <WidgetHelpScreen mode={mode} />,
  };

  // If screen is "auth" (stale localStorage), redirect to selection
  const activeScreen = screen === "auth" ? "selection" : screen;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative min-h-0">
        {screenComponents[activeScreen] || screenComponents["selection"]}
      </main>

      {/* Consent Notice — shown on selection and chat */}
      {(activeScreen === "selection" || activeScreen === "chat") && (
        <div className="shrink-0 border-t border-neutral-100 bg-neutral-50 px-3 py-1.5 text-center">
          <p className="text-[10px] text-neutral-400 leading-tight">
            By chatting, you agree to share your details with our team.
          </p>
        </div>
      )}

      {/* Footer — Hidden from chat and loading screens */}
      {activeScreen !== "loading" &&
        activeScreen !== "error" &&
        activeScreen !== "chat" &&
        footerVisible && (
          <WidgetFooter showBranding={widgetConfig.showBranding} />
        )}
    </div>
  );
};
