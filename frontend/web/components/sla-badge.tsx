"use client";

import { cn } from "@connect/ui/lib/utils";
import { useEffect, useState } from "react";

interface SLABadgeProps {
  status: "on_track" | "warning" | "breached" | "none";
  timeRemaining: number | null;
  deadline: string | null;
  compact?: boolean;
}

export function SLABadge({ status, timeRemaining, deadline, compact }: SLABadgeProps) {
  const [displayTime, setDisplayTime] = useState<string>("");

  useEffect(() => {
    if (timeRemaining === null || !deadline) {
      setDisplayTime("");
      return;
    }

    function update() {
      const now = Date.now();
      const dl = deadline ? new Date(deadline).getTime() : 0;
      const diff = dl - now;
      if (diff <= 0) {
        setDisplayTime("Breached");
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (hours > 0) {
        setDisplayTime(`${hours}h ${mins}m`);
      } else {
        setDisplayTime(`${mins}m`);
      }
    }

    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [timeRemaining, deadline]);

  if (status === "none") return null;

  const styles = {
    on_track: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    breached: "bg-red-50 text-red-700 border-red-200",
  };

  const dots = {
    on_track: "bg-emerald-500",
    warning: "bg-amber-500",
    breached: "bg-red-500",
  };

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none",
          styles[status]
        )}
        title={displayTime ? `SLA ${status === "breached" ? "breached" : `${displayTime} remaining`}` : `SLA ${status}`}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
        {displayTime || (status === "breached" ? "Breach" : "SLA")}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {status === "breached"
        ? "SLA Breached"
        : displayTime
        ? `${displayTime} left`
        : "On Track"}
    </span>
  );
}
