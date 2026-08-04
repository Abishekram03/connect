import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { WidgetScreen } from "../types";
import { CONTACT_SESSION_KEY } from "../constants";

export const screenAtom = atom<WidgetScreen>("loading");
export const isOpenAtom = atom<boolean>(false);
export const organizationIdAtom = atom<string | null>(null);
export const footerVisibleAtom = atom<boolean>(true);

// Store session token (string) for API authentication
export const sessionTokenAtomFamily = atomFamily((organizationId: string) => {
  return atomWithStorage<string | null>(
    `${CONTACT_SESSION_KEY}_token_${organizationId}`,
    null,
  );
});

export const errorMessageAtom = atom<string | null>(null);
export const loadingMessageAtom = atom<string | null>(null);
export const conversationIdAtom = atom<string | null>(null);
export const isAiConversationAtom = atom<boolean>(true);

// Widget configuration from dashboard
export interface WidgetConfig {
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  borderRadius: number;
  companyName: string;
  logoUrl?: string;
  welcomeHeading?: string;
  welcomeSubheading?: string;
  welcomeMessage?: string;
  firstAiGreeting?: string;
  firstHumanGreeting?: string;
  aiFirstMessage?: string;
  agentFirstMessage?: string;
  aiFallbackMessage?: string;
  aiEnabled: boolean;
  autoGreet: boolean;
  autoGreetDelay: number;
  collectEmail: boolean;
  collectEmailRequired: boolean;
  allowAttachments: boolean;
  maxFileSize: number;
  showBranding: boolean;
  customCss?: string;
  // Plan-based access
  currentPlan: "free" | "starter" | "pro" | "enterprise";
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  primaryColor: "#2563eb",
  position: "bottom-right",
  borderRadius: 16,
  companyName: "Support",
  welcomeHeading: "Hi there! 👋",
  welcomeSubheading: "How can we help you today?",
  welcomeMessage: "Hi! How can we help you today?",
  firstAiGreeting: undefined,
  firstHumanGreeting: undefined,
  aiFirstMessage: undefined,
  agentFirstMessage: undefined,
  aiFallbackMessage:
    "Our AI assistant is currently unavailable. Please chat with a human agent or try again later.",
  aiEnabled: true,
  autoGreet: true,
  autoGreetDelay: 3,
  collectEmail: true,
  collectEmailRequired: false,
  allowAttachments: true,
  maxFileSize: 10,
  showBranding: true,
  currentPlan: "free",
};

export const widgetConfigAtom = atom<WidgetConfig>(DEFAULT_WIDGET_CONFIG);

// Store contact email for fetching conversation history across sessions
export const contactEmailAtomFamily = atomFamily((organizationId: string) => {
  return atomWithStorage<string | null>(
    `${CONTACT_SESSION_KEY}_email_${organizationId}`,
    null,
  );
});

// Store contact name for personalized greetings across auth/home screens
export const contactNameAtomFamily = atomFamily((organizationId: string) => {
  return atomWithStorage<string | null>(
    `${CONTACT_SESSION_KEY}_name_${organizationId}`,
    null,
  );
});

// Track if the current conversation is from a previous session (read-only history)
export const isHistoricalConversationAtom = atom<boolean>(false);

// Track if a help article is open (wider panel)
export const articleOpenAtom = atom<boolean>(false);
