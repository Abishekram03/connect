import { cn } from "@connect/ui/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import React from "react";
import { useAtomValue } from "jotai";
import { widgetConfigAtom } from "../../atoms/widget-atoms";

interface WidgetHeaderProps {
  children: React.ReactNode;
  className?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const WidgetHeader = ({
  children,
  className,
  showBack,
  onBack,
}: WidgetHeaderProps) => {
  const widgetConfig = useAtomValue(widgetConfigAtom);

  return (
    <header
      className={cn("px-3 pt-4 pb-3 text-white shrink-0", className)}
      style={{ backgroundColor: widgetConfig?.primaryColor || "#2563eb" }}       
    >
      <div>
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-white/80 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeftIcon className="size-3" />
            <span>Back</span>
          </button>
        )}
        {children}
      </div>
    </header>
  );
};
