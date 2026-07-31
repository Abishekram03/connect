"use client";

import { useAtom, useAtomValue } from "jotai";
import { isOpenAtom, widgetConfigAtom, articleOpenAtom } from "../../atoms/widget-atoms";
import { WidgetLauncher } from "../components/widget-launcher";
import { WidgetView } from "./widget-view";

interface Props {
  organizationId: string;
  mode?: "preview" | "production";
}

export const WidgetPreviewShell = ({ organizationId, mode = "preview" }: Props) => {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  const config = useAtomValue(widgetConfigAtom);
  const articleOpen = useAtomValue(articleOpenAtom);

  const panelPos = config.position === "bottom-left" ? "top-3 left-3" : "top-3 right-3";
  const panelRadius = config.borderRadius || 16;

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <WidgetLauncher />

      {isOpen && (
        <div
          className={`fixed z-[60] h-[400px] overflow-hidden bg-white shadow-2xl transition-all duration-200 ${panelPos}`}
          style={{ borderRadius: panelRadius, width: articleOpen ? 500 : 340 }}
        >
          <WidgetView organizationId={organizationId} mode={mode} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};
