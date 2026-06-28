"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";

const MOBILE_BP = 720;

function headerBottom(): number {
  const header =
    document.querySelector<HTMLElement>(".vol-main-header") ??
    document.querySelector<HTMLElement>(".org-main-header") ??
    document.querySelector<HTMLElement>(".public-nav-header");
  return header?.getBoundingClientRect().bottom ?? 64;
}

function computeMobileStyles(): { panel?: CSSProperties; backdrop?: CSSProperties } {
  if (typeof window === "undefined" || window.innerWidth > MOBILE_BP) return {};
  const bottom = headerBottom();
  const top = bottom + 8;
  return {
    panel: {
      position: "fixed",
      top,
      left: 12,
      right: 12,
      width: "auto",
      maxWidth: "none",
      maxHeight: `calc(100dvh - ${top + 12}px)`,
    },
    backdrop: {
      top: bottom,
      left: 0,
      right: 0,
      bottom: 0,
    },
  };
}

/** Fixed panel + backdrop placement on small screens so dropdowns aren't clipped. */
export function useMobileHeaderPop(open: boolean): {
  panelStyle?: CSSProperties;
  backdropStyle?: CSSProperties;
} {
  const [styles, setStyles] = useState<{ panel?: CSSProperties; backdrop?: CSSProperties }>(() =>
    open ? computeMobileStyles() : {}
  );

  useLayoutEffect(() => {
    if (!open) {
      setStyles({});
      return;
    }

    function update() {
      setStyles(computeMobileStyles());
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  return { panelStyle: styles.panel, backdropStyle: styles.backdrop };
}

/** @deprecated Use useMobileHeaderPop */
export function useMobilePopStyle(open: boolean): CSSProperties | undefined {
  return useMobileHeaderPop(open).panelStyle;
}
