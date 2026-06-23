"use client";

/**
 * Recovers from stale-chunk errors. When the deployed/compiled JS changes, an
 * already-open tab can ask for a chunk filename that no longer exists →
 * "ChunkLoadError: Loading chunk … failed". This catches that (and chunk-load
 * promise rejections) and reloads the page once to pull the fresh chunks.
 *
 * A short cooldown (sessionStorage) guarantees it can never loop: if a reload
 * doesn't fix it, the error is allowed to surface instead of reloading forever.
 */
import { useEffect } from "react";

const KEY = "nl_chunk_reload_at";
const COOLDOWN_MS = 10_000;

function isChunkError(value: unknown): boolean {
  if (!value) return false;
  const s =
    typeof value === "string"
      ? value
      : `${(value as { name?: string }).name ?? ""} ${(value as { message?: string }).message ?? ""}`;
  return /ChunkLoadError|Loading chunk [^ ]+ failed|Loading CSS chunk/i.test(s);
}

export default function ChunkReloadGuard() {
  useEffect(() => {
    function recover() {
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(KEY) || 0);
      } catch {
        /* sessionStorage unavailable — fall through and reload */
      }
      if (Date.now() - last < COOLDOWN_MS) return; // already tried recently — let it surface
      try {
        sessionStorage.setItem(KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      window.location.reload();
    }
    const onError = (e: ErrorEvent) => {
      if (isChunkError(e.error) || isChunkError(e.message)) recover();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isChunkError(e.reason)) recover();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
