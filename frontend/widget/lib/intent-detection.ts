/**
 * Intent Detection Utility
 * ────────────────────────
 * Analyzes user messages to detect their intent and concern.
 * Used for GDPR-compliant data collection and lead classification.
 */

export type DetectedIntent =
  | "support_need"
  | "sales_inquiry"
  | "feedback"
  | "general";

export interface IntentAnalysis {
  intent: DetectedIntent;
  confidence: number; // 0-1
  detectedIssue?: string;
  keywords: string[];
}

// Keywords for different intent categories
const SUPPORT_KEYWORDS = [
  "problem",
  "issue",
  "bug",
  "error",
  "broken",
  "not working",
  "crash",
  "fail",
  "help",
  "stuck",
  "can't",
  "cannot",
  "don't know",
  "how to",
  "login",
  "password",
  "account",
  "payment",
  "billing",
  "refund",
  "cancel",
  "delete",
  "reset",
  "urgent",
  "asap",
  "fix",
  "resolve",
];

const SALES_KEYWORDS = [
  "pricing",
  "cost",
  "price",
  "subscription",
  "plan",
  "enterprise",
  "demo",
  "trial",
  "feature",
  "capabilities",
  "integration",
  "api",
  "custom",
  "white label",
  "reseller",
  "partnership",
  "interested",
  "sales",
  "buy",
  "purchase",
  "upgrade",
  "comparison",
];

const FEEDBACK_KEYWORDS = [
  "feedback",
  "suggest",
  "idea",
  "feature request",
  "improvement",
  "love",
  "hate",
  "great",
  "amazing",
  "terrible",
  "review",
  "rating",
];

export function detectIntent(userMessage: string): IntentAnalysis {
  const lowerMessage = userMessage.toLowerCase();
  const words = lowerMessage.split(/\s+/);

  // Count keyword matches
  const supportMatches = SUPPORT_KEYWORDS.filter((kw) =>
    lowerMessage.includes(kw),
  ).length;
  const salesMatches = SALES_KEYWORDS.filter((kw) =>
    lowerMessage.includes(kw),
  ).length;
  const feedbackMatches = FEEDBACK_KEYWORDS.filter((kw) =>
    lowerMessage.includes(kw),
  ).length;

  // Determine primary intent
  let intent: DetectedIntent = "general";
  let confidence = 0;
  let matchedKeywords: string[] = [];

  if (
    supportMatches >= salesMatches &&
    supportMatches >= feedbackMatches &&
    supportMatches > 0
  ) {
    intent = "support_need";
    confidence = Math.min(supportMatches / 3, 1);
    matchedKeywords = SUPPORT_KEYWORDS.filter((kw) =>
      lowerMessage.includes(kw),
    );
  } else if (salesMatches > feedbackMatches && salesMatches > 0) {
    intent = "sales_inquiry";
    confidence = Math.min(salesMatches / 3, 1);
    matchedKeywords = SALES_KEYWORDS.filter((kw) => lowerMessage.includes(kw));
  } else if (feedbackMatches > 0) {
    intent = "feedback";
    confidence = Math.min(feedbackMatches / 2, 1);
    matchedKeywords = FEEDBACK_KEYWORDS.filter((kw) =>
      lowerMessage.includes(kw),
    );
  }

  // Extract detected issue
  let detectedIssue = "your issue";
  if (intent === "support_need") {
    // Try to extract specific issue
    if (lowerMessage.includes("login")) detectedIssue = "login issue";
    else if (lowerMessage.includes("password"))
      detectedIssue = "password issue";
    else if (
      lowerMessage.includes("payment") ||
      lowerMessage.includes("billing")
    )
      detectedIssue = "billing issue";
    else if (lowerMessage.includes("account")) detectedIssue = "account issue";
    else if (lowerMessage.includes("error") || lowerMessage.includes("bug"))
      detectedIssue = "technical issue";
    else if (lowerMessage.includes("integration"))
      detectedIssue = "integration problem";
    else {
      // Use first meaningful word after "problem", "issue", etc.
      const problemIdx =
        lowerMessage.indexOf("problem") || lowerMessage.indexOf("issue");
      if (problemIdx !== -1) {
        const wordsAfter = words.slice(
          words.findIndex((w) => w.includes("problem") || w.includes("issue")) +
            1,
          Math.min(
            words.length,
            words.findIndex(
              (w) => w.includes("problem") || w.includes("issue"),
            ) + 4,
          ),
        );
        if (wordsAfter.length > 0) {
          detectedIssue = wordsAfter.join(" ");
        }
      }
    }
  }

  return {
    intent,
    confidence,
    detectedIssue,
    keywords: matchedKeywords,
  };
}

/**
 * Determine if an action requires marketing consent.
 * Marketing/Sales actions need explicit consent; Support actions don't require it upfront.
 */
export function requiresMarketingConsent(intent: DetectedIntent): boolean {
  return intent === "sales_inquiry" || intent === "feedback";
}

/**
 * Determine if an action can proceed without consent.
 * Support requests can be addressed without consent, but data is still collected with basic consent.
 */
export function canProceedWithoutConsent(intent: DetectedIntent): boolean {
  return intent === "support_need" || intent === "general";
}
