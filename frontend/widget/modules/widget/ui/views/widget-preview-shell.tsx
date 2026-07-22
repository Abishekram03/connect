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

  const panelPos = config.position === "bottom-left" ? "bottom-4 left-4" : "bottom-4 right-4";
  const panelRadius = config.borderRadius || 16;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="h-full w-full bg-[#f5f5f5] p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: config.primaryColor }} />
            <div>
              <div className="h-4 w-32 rounded bg-gray-300" />
              <div className="mt-1 h-3 w-48 rounded bg-gray-200" />
            </div>
          </div>

          <div className="mb-6 h-48 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-5/6 rounded bg-gray-100" />
              <div className="h-3 w-4/6 rounded bg-gray-100" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full rounded bg-gray-100" />
                  <div className="h-2.5 w-4/5 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 h-32 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 h-4 w-1/2 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-3/4 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>

      <WidgetLauncher />

      {isOpen && (
        <div
          className={`fixed z-[60] h-[480px] overflow-hidden bg-white shadow-2xl transition-all duration-200 ${panelPos}`}
          style={{ borderRadius: panelRadius, width: articleOpen ? 520 : 360 }}
        >
          <WidgetView organizationId={organizationId} mode={mode} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};
