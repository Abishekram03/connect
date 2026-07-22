/**
 * Widget Session Management
 * ──────────────────────────
 * Handles 24-hour session tokens stored in localStorage.
 * Sessions are validated against the backend on every widget load.
 * Expired or invalid sessions are cleared and a fresh one is created.
 */

const SESSION_STORAGE_KEY = "connect_widget_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface StoredSession {
  sessionToken: string;
  organizationId: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Get the stored session from localStorage.
 * Returns null if no session, expired, or malformed.
 */
export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session: StoredSession = JSON.parse(raw);

    // Client-side expiry check (server also validates)
    if (Date.now() > session.expiresAt) {
      clearStoredSession();
      return null;
    }

    // Validate structure
    if (
      !session.sessionToken ||
      !session.organizationId ||
      !session.expiresAt
    ) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch {
    clearStoredSession();
    return null;
  }
}

/**
 * Store a new session in localStorage.
 */
export function storeSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

/**
 * Clear the stored session.
 */
export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Check if a session is within 1 hour of expiry (for proactive renewal).
 */
export function isSessionNearExpiry(session: StoredSession): boolean {
  const oneHour = 60 * 60 * 1000;
  return Date.now() > session.expiresAt - oneHour;
}
