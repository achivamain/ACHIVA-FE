"use client";

type QueuedToast = {
  message: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning";
};

const QUEUED_TOAST_KEY = "queued-toast";

export function queueToast(nextToast: QueuedToast) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(QUEUED_TOAST_KEY, JSON.stringify(nextToast));
}

export function consumeQueuedToast() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(QUEUED_TOAST_KEY);

  if (!raw) {
    return null;
  }

  window.sessionStorage.removeItem(QUEUED_TOAST_KEY);

  try {
    return JSON.parse(raw) as QueuedToast;
  } catch {
    return null;
  }
}
