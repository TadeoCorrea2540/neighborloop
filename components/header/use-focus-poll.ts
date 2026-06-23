"use client";

/**
 * Runs `fn` whenever the tab regains focus / becomes visible, and (optionally)
 * on a fixed interval. Used to keep header badges + the open thread fresh
 * without relying on realtime delivery. `fn` is read through a ref so callers
 * don't need to memoize it.
 */
import { useEffect, useRef } from "react";

export function useFocusPoll(fn: () => void, intervalMs = 0) {
  const ref = useRef(fn);
  ref.current = fn;

  useEffect(() => {
    const run = () => ref.current();
    const onVisible = () => { if (document.visibilityState === "visible") run(); };
    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", onVisible);
    const id = intervalMs > 0 ? window.setInterval(run, intervalMs) : 0;
    return () => {
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", onVisible);
      if (id) window.clearInterval(id);
    };
  }, [intervalMs]);
}
