"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

type WidgetPosition = "bottom-right" | "bottom-left";
type Plan = "free" | "starter" | "pro" | "enterprise";

interface WidgetConfig {
  primaryColor: string;
  position: WidgetPosition;
  borderRadius: number;
  companyName: string;
  showBranding: boolean;
  welcomeHeading: string;
  welcomeSubheading: string;
  welcomeMessage: string;
  aiEnabled: boolean;
  autoGreet: boolean;
  autoGreetDelay: number;
  collectEmail: boolean;
  collectEmailRequired: boolean;
  allowAttachments: boolean;
  maxFileSize: number;
  helpCenterEnabled: boolean;
  showFaqsOnHome: boolean;
  faqsDisplayCount: number;
}

const defaultConfig: WidgetConfig = {
  primaryColor: "#2563eb",
  position: "bottom-right",
  borderRadius: 16,
  companyName: "Connect",
  showBranding: true,
  welcomeHeading: "Hi there! 👋",
  welcomeSubheading: "How can we help you today?",
  welcomeMessage: "Hi! How can we help you today?",
  aiEnabled: true,
  autoGreet: true,
  autoGreetDelay: 3,
  collectEmail: true,
  collectEmailRequired: false,
  allowAttachments: true,
  maxFileSize: 10,
  helpCenterEnabled: false,
  showFaqsOnHome: false,
  faqsDisplayCount: 3,
};

function CollapsibleGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 px-4 py-2.5 text-left text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        {title}
      </button>
      {open && <div className="space-y-2 px-3 pb-3">{children}</div>}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded border border-border p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 rounded border border-border bg-surface px-1 py-0.5 text-xs text-ink outline-none"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded border border-border bg-surface pl-2 pr-5 py-0.5 text-sm text-ink outline-none cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-4 w-7 rounded-full transition-colors ${
          value ? "bg-accent" : "bg-surface-2"
        }`}
      >
        <div
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-12 rounded border border-border bg-surface px-1 py-0.5 text-sm text-ink outline-none text-right"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-border bg-surface px-2 py-1 text-sm text-ink outline-none focus:border-ink"
      />
    </div>
  );
}

export default function WidgetPage() {
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
  const [showPreview, setShowPreview] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);

  const update = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const sendConfigToIframe = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "connect:config", payload: config },
        "*",
      );
    }
  }, [config]);

  useEffect(() => {
    if (iframeReady) sendConfigToIframe();
  }, [sendConfigToIframe, iframeReady]);

  return (
    <div className="flex h-full gap-1.5 md:pl-3">
      <div className="flex flex-1 flex-col bg-card shadow-sm overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <h2 className="text-sm font-semibold text-ink">Widget</h2>
        </div>

        <CollapsibleGroup title="Launcher" defaultOpen>
          <SelectField
            label="Position"
            value={config.position}
            options={[
              { label: "Bottom Right", value: "bottom-right" },
              { label: "Bottom Left", value: "bottom-left" },
            ]}
            onChange={(v) => update("position", v as WidgetPosition)}
          />
          <NumberField label="Border Radius" value={config.borderRadius} min={0} max={32} suffix="px" onChange={(v) => update("borderRadius", v)} />
        </CollapsibleGroup>

        <CollapsibleGroup title="Branding" defaultOpen>
          <ColorField label="Primary Color" value={config.primaryColor} onChange={(v) => update("primaryColor", v)} />
          <TextField label="Company Name" value={config.companyName} onChange={(v) => update("companyName", v)} />
          <ToggleField label="Show Branding" value={config.showBranding} onChange={(v) => update("showBranding", v)} />
        </CollapsibleGroup>

        <CollapsibleGroup title="Greeting">
          <TextField label="Heading" value={config.welcomeHeading} onChange={(v) => update("welcomeHeading", v)} />
          <TextField label="Subheading" value={config.welcomeSubheading} onChange={(v) => update("welcomeSubheading", v)} />
          <TextField label="Message" value={config.welcomeMessage} onChange={(v) => update("welcomeMessage", v)} />
          <ToggleField label="Auto Greet" value={config.autoGreet} onChange={(v) => update("autoGreet", v)} />
          <NumberField label="Greet Delay" value={config.autoGreetDelay} min={0} max={30} suffix="s" onChange={(v) => update("autoGreetDelay", v)} />
        </CollapsibleGroup>

        <CollapsibleGroup title="Behavior">
          <ToggleField label="AI Enabled" value={config.aiEnabled} onChange={(v) => update("aiEnabled", v)} />
          <ToggleField label="Allow Attachments" value={config.allowAttachments} onChange={(v) => update("allowAttachments", v)} />
          <NumberField label="Max File Size" value={config.maxFileSize} min={1} max={50} suffix="MB" onChange={(v) => update("maxFileSize", v)} />
        </CollapsibleGroup>

        <CollapsibleGroup title="Data Collection">
          <ToggleField label="Collect Email" value={config.collectEmail} onChange={(v) => update("collectEmail", v)} />
          <ToggleField label="Email Required" value={config.collectEmailRequired} onChange={(v) => update("collectEmailRequired", v)} />
        </CollapsibleGroup>

        <CollapsibleGroup title="Help Center">
          <ToggleField label="Help Center Enabled" value={config.helpCenterEnabled} onChange={(v) => update("helpCenterEnabled", v)} />
          <ToggleField label="Show FAQs on Home" value={config.showFaqsOnHome} onChange={(v) => update("showFaqsOnHome", v)} />
          <NumberField label="FAQ Display Count" value={config.faqsDisplayCount} min={1} max={10} onChange={(v) => update("faqsDisplayCount", v)} />
        </CollapsibleGroup>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-tr-lg bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <h3 className="text-sm font-semibold text-ink">Preview</h3>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "Hide Widget" : "Show Widget"}
          </button>
        </div>
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#f8f9fa]">
          {!showPreview && (
            <span className="text-sm text-muted-foreground">Widget hidden</span>
          )}
          <iframe
            ref={iframeRef}
            src="http://localhost:3001?mode=preview"
            className={`h-full w-full border-0 transition-opacity ${showPreview ? "opacity-100" : "pointer-events-none opacity-0"}`}
            title="Widget Preview"
            onLoad={() => {
              setIframeReady(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
