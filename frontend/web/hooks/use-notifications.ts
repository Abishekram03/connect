"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api-client";
import { playNotificationSound } from "@/lib/notification-sound";

export interface Notification {
  id: number;
  type: "new_conversation" | "new_message" | "assignment" | "mention";
  title: string;
  body: string;
  conversation_id: number | null;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastCheckRef = useRef<string>(new Date().toISOString());
  const prevCountRef = useRef(0);
  const soundEnabled = useRef(true);

  const checkNotifications = useCallback(async () => {
    try {
      const res = await api.get<{ results: Notification[] }>("/api/notifications", {
        params: { after: lastCheckRef.current, limit: "20" },
      });
      const newNotifs = res.results || [];
      if (newNotifs.length > 0 && prevCountRef.current > 0 && soundEnabled.current && localStorage.getItem("notification_sound") !== "off") {
        playNotificationSound();
      }
      setNotifications((prev) => {
        const existing = new Set(prev.map((n) => n.id));
        const fresh = newNotifs.filter((n) => !existing.has(n.id));
        return [...fresh, ...prev].slice(0, 50);
      });
      setUnreadCount((prev) => {
        const newUnread = newNotifs.filter((n) => !n.read).length;
        return prev + newUnread;
      });
      lastCheckRef.current = new Date().toISOString();
    } catch {}
    setLoading(false);
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000);
    prevCountRef.current = unreadCount;
    return () => clearInterval(interval);
  }, [checkNotifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: checkNotifications,
  };
}
