"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getStoredSession,
  storeSession,
  clearStoredSession,
  StoredSession,
} from "../lib/session";

interface UseWidgetSessionReturn {
  sessionToken: string | null;
  sessionId: string | null;
  organizationId: string | null;
  isLoading: boolean;
  error: string | null;
  createSession: (contactName?: string, contactEmail?: string) => Promise<void>;
  updateContact: (name: string, email: string) => Promise<void>;
}

export function useWidgetSession(
  organizationId: string,
): UseWidgetSessionReturn {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredSession();
    if (stored && stored.organizationId === organizationId) {
      setSessionToken(stored.sessionToken);
      setSessionId(stored.sessionToken);
    } else {
      clearStoredSession();
    }
    setIsLoading(false);
  }, [organizationId]);

  const createSession = useCallback(
    async (contactName?: string, contactEmail?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = {
      sessionToken: null,
      sessionId: null,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        const stored: StoredSession = {
          sessionToken: result.sessionToken,
          organizationId,
          expiresAt: result.expiresAt,
          createdAt: Date.now(),
        };

        storeSession(stored);
        setSessionToken(result.sessionToken);
        setSessionId(result.sessionId);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create session",
        );
        setIsLoading(false);
      }
    },
    [organizationId],
  );

  const updateContact = useCallback(
    async (name: string, email: string) => {
      console.log("Contact updated:", name, email);
    },
    [],
  );

  return {
    sessionToken,
    sessionId,
    organizationId,
    isLoading,
    error,
    createSession,
    updateContact,
  };
}
