"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// Horizontal snap rail with prev/next buttons. <RailControls /> can sit
// anywhere inside <ScrollRail> (e.g. a section heading's aside) and drives
// the sibling <RailTrack />.
type Rail = {
  trackRef: React.RefObject<HTMLDivElement | null>;
  canPrev: boolean;
  canNext: boolean;
  update: () => void;
};

const RailContext = createContext<Rail | null>(null);

export function ScrollRail({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);
  return <RailContext.Provider value={{ trackRef, canPrev, canNext, update }}>{children}</RailContext.Provider>;
}

function useRail() {
  const rail = useContext(RailContext);
  if (!rail) throw new Error("Rail parts must be inside <ScrollRail>");
  return rail;
}

// Full-bleed track whose first item lines up with the page's .wrap content.
const GUTTER = "max(clamp(16px, 4vw, 64px), calc((100% - 1440px) / 2 + clamp(16px, 4vw, 64px)))";

export function RailTrack({ children, label }: { children: ReactNode; label: string }) {
  const { trackRef, update } = useRail();
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [trackRef, update]);

  return (
    <div
      ref={trackRef}
      role="region"
      aria-label={label}
      className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 scrollbar-hide"
      style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
    >
      {children}
    </div>
  );
}

export function RailControls({ light }: { light?: boolean }) {
  const { trackRef, canPrev, canNext } = useRail();
  // Nothing to scroll: no buttons.
  if (!canPrev && !canNext) return null;
  const go = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const btn = `flex size-11 items-center justify-center transition-colors disabled:cursor-default ${
    light
      ? "border border-white/40 hover:enabled:bg-white/10 disabled:opacity-30"
      : "bg-ink text-paper hover:enabled:bg-night disabled:bg-stone disabled:text-ink-muted"
  }`;
  return (
    <div className="flex gap-2">
      <button type="button" aria-label="Previous" disabled={!canPrev} onClick={() => go(-1)} className={btn}>
        <ChevronLeftIcon size={20} strokeWidth={1.8} />
      </button>
      <button type="button" aria-label="Next" disabled={!canNext} onClick={() => go(1)} className={btn}>
        <ChevronRightIcon size={20} strokeWidth={1.8} />
      </button>
    </div>
  );
}
