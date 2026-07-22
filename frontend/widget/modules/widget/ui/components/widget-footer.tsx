import { cn } from "@connect/ui/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { Icon } from "@iconify/react";
import { screenAtom, widgetConfigAtom } from "../../atoms/widget-atoms";

export const WidgetFooter = ({
  showBranding = true,
}: {
  showBranding?: boolean;
}) => {
  const screen = useAtomValue(screenAtom);
  const widgetConfig = useAtomValue(widgetConfigAtom);
  const setScreen = useSetAtom(screenAtom);

  // Helper to check active tab.
  // "selection" is Home. "inbox" is Inbox. "chat" is also related to Inbox but usually highlights Inbox?
  // User says "Clicking switches screens".
  // Note: if screen is "chat", Inbox icon should probably be active or neutral?
  // Customary: If I am deep in chat (from Inbox), Inbox tab is active.
  const isHome = screen === "selection";
  const isInbox = screen === "inbox" || screen === "chat";
  const isHelp = screen === "help";
  const activeColor = widgetConfig.primaryColor || "#2563eb";

  return (
    <footer className="flex flex-col border-t border-black/5 bg-white/90 py-2 backdrop-blur-sm shrink-0">
      <div className="flex items-center justify-around w-full">
        <button
          className={cn(
            "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors",
            isHome ? "text-neutral-900" : "text-gray-500 hover:text-gray-700",
          )}
          onClick={() => setScreen("selection")}
          aria-label="Go to home"
        >
          <Icon
            icon={isHome ? "solar:home-2-bold" : "solar:home-2-linear"}
            className="h-5 w-5"
            style={{ color: isHome ? activeColor : undefined }}
          />
          <span className="text-[11px] leading-none">Home</span>
        </button>

        <button
          className={cn(
            "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors",
            isInbox ? "text-neutral-900" : "text-gray-500 hover:text-gray-700",
          )}
          onClick={() => setScreen("inbox")}
          aria-label="Go to chat inbox"
        >
          <Icon
            icon={isInbox ? "solar:chat-round-bold" : "solar:chat-round-linear"}
            className="h-5 w-5"
            style={{ color: isInbox ? activeColor : undefined }}
          />
          <span className="text-[11px] leading-none">Messages</span>
        </button>

        {widgetConfig.helpCenterEnabled && (
          <button
            className={cn(
              "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-colors",
              isHelp ? "text-neutral-900" : "text-gray-500 hover:text-gray-700",
            )}
            onClick={() => setScreen("help")}
            aria-label="Go to help center"
          >
            <Icon
              icon={
                isHelp
                  ? "solar:question-circle-bold"
                  : "solar:question-circle-linear"
              }
              className="h-5 w-5"
              style={{ color: isHelp ? activeColor : undefined }}
            />
            <span className="text-[11px] leading-none">Help</span>
          </button>
        )}
      </div>

      {showBranding && (
        <div className="text-center">
          <a
            href="https://onconnect.one"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-gray-400 hover:text-gray-500 transition-colors font-medium"
          >
            Powered by Connect
          </a>
        </div>
      )}
    </footer>
  );
};
