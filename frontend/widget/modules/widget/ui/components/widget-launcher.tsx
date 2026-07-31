"use client";

import { useAtom } from "jotai";
import { MessageSquare, X } from "lucide-react";
import { isOpenAtom, widgetConfigAtom } from "../../atoms/widget-atoms";
import { cn } from "@connect/ui/lib/utils";

export const WidgetLauncher = () => {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const [activeConfig] = useAtom(widgetConfigAtom);

  const launcherColor = activeConfig?.primaryColor || "#2563eb";
  const position = activeConfig?.position || "bottom-right";
  const posClasses = position === "bottom-left" ? "bottom-3 left-4" : "bottom-3 right-4";

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "fixed z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
        "text-white",
        posClasses,
      )}
      style={{ backgroundColor: launcherColor }}
      aria-label={isOpen ? "Close widget" : "Open widget"}
    >
      <div className="relative h-6 w-6">
        <MessageSquare
          className={cn(
            "absolute inset-0 h-6 w-6 transition-all duration-300",
            isOpen ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0",
          )}
        />
        <X
          className={cn(
            "absolute inset-0 h-6 w-6 transition-all duration-300",
            isOpen ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90",
          )}
        />
      </div>
    </button>
  );
};
