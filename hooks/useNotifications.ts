"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "pm_notifications_v1";
const EVENT = "pm-notif-updated";
const MAX_STORED = 50;

export type NotifType = "pr" | "workout" | "progress" | "program";

export interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  dedupeKey?: string;
}

function load(): Notif[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Notif[]) : [];
  } catch {
    return [];
  }
}

function save(notifs: Notif[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(notifs.slice(0, MAX_STORED)));
    window.dispatchEvent(new Event(EVENT));
  } catch {}
}

/**
 * Ajoute une notification réelle, dédupliquée par `dedupeKey` (évite de spammer
 * la même alerte à chaque re-render/effet — un dedupeKey n'est stocké qu'une fois).
 */
export function pushNotification(type: NotifType, title: string, body: string, dedupeKey?: string) {
  const current = load();
  if (dedupeKey && current.some(n => n.dedupeKey === dedupeKey)) return;
  const notif: Notif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    body,
    createdAt: new Date().toISOString(),
    read: false,
    dedupeKey,
  };
  save([notif, ...current]);
}

export function useNotifications() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function read() {
      setNotifs(load());
      setReady(true);
    }
    read();
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) read();
    }
    function onUpdated() { read(); }
    function onVisible() {
      if (document.visibilityState === "visible") read();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(EVENT, onUpdated);
    window.addEventListener("focus", onUpdated);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVENT, onUpdated);
      window.removeEventListener("focus", onUpdated);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const markRead = useCallback((id: string) => {
    const next = load().map(n => (n.id === id ? { ...n, read: true } : n));
    save(next);
  }, []);

  const markAllRead = useCallback(() => {
    const next = load().map(n => ({ ...n, read: true }));
    save(next);
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  return { notifs, ready, unreadCount, markRead, markAllRead };
}
