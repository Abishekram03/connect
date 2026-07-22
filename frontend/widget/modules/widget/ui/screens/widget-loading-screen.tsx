"use client";

import { useAtomValue } from "jotai";
import { LoaderIcon } from "lucide-react";
import {
  loadingMessageAtom,
} from "../../atoms/widget-atoms";

export const WidgetLoadingScreen = () => {
  const loadingMessage = useAtomValue(loadingMessageAtom);

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
      <LoaderIcon className="animate-spin" />
      <p className="text-sm">{loadingMessage || "Loading..."}</p>
    </div>
  );
};
