"use client";

import { useRef, useState } from "react";
import Photo from "@/components/site/photo";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export type Slide = { src: string; caption?: string };

// How many slides either side of the current one stay mounted, so their
// images are already fetched and decoded when the visitor gets there.
const PRELOAD = 2;
const SWIPE_PX = 40;

// Peek carousel: the current photo with slivers of the previous and next.
// Every frame keeps its slides stacked and crossfades between them instead of
// swapping one <img> src, which blanked the frame while the new file loaded.
export default function GalleryCarousel({ slides }: { slides: Slide[] }) {
  const n = slides.length;
  const [i, setI] = useState(0);
  // Slides shown once stay mounted, so going back is instant too.
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const touchX = useRef<number | null>(null);

  if (!n) return null;
  const wrap = (k: number) => ((k % n) + n) % n;
  const cur = slides[i];

  const go = (step: number) => {
    const next = wrap(i + step);
    setI(next);
    setVisited((v) => (v.has(next) ? v : new Set(v).add(next)));
  };

  const mounted = new Set(visited);
  for (let d = -PRELOAD; d <= PRELOAD; d += 1) mounted.add(wrap(i + d));
  const indices = [...mounted].sort((a, b) => a - b);

  // One frame (main or a peek): all mounted slides stacked, `show` on top.
  const frame = (show: number, sizes: string, alt: boolean) =>
    indices.map((k) => (
      <div
        key={k}
        aria-hidden={k !== show}
        className={`absolute inset-0 transition-opacity duration-300 ease-out ${k === show ? "opacity-100" : "opacity-0"}`}
      >
        <Photo src={slides[k].src} alt={alt && k === show ? slides[k].caption ?? "" : ""} sizes={sizes} />
      </div>
    ));

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Trip photos"
      className="overflow-hidden pt-10 outline-none lg:pt-14"
      onKeyDown={(e) => {
        if (n < 2) return;
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div className="flex h-[300px] items-stretch gap-3 sm:h-[480px] lg:h-[640px]">
        {n > 1 && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => go(-1)}
            className="relative hidden flex-[0_0_18%] cursor-w-resize overflow-hidden bg-stone sm:block"
          >
            {frame(wrap(i - 1), "18vw", false)}
          </button>
        )}
        <figure
          className="relative m-0 flex-1 touch-pan-y overflow-hidden bg-stone"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null || n < 2) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
          }}
        >
          {frame(i, "(min-width: 640px) 64vw, 100vw", true)}
        </figure>
        {n > 1 && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => go(1)}
            className="relative hidden flex-[0_0_18%] cursor-e-resize overflow-hidden bg-stone sm:block"
          >
            {frame(wrap(i + 1), "18vw", false)}
          </button>
        )}
      </div>
      {n > 1 && (
        <div className="wrap flex items-center justify-between gap-5 pt-5">
          <button type="button" onClick={() => go(-1)} className="meta flex min-h-11 items-center gap-3 text-[14px] tracking-[0.1em]">
            <ArrowLeftIcon strokeWidth={1.6} size={22} />
            Prev
          </button>
          <span className="text-center text-base text-ink-muted" aria-live="polite">
            {cur.caption ? `${cur.caption} · ` : ""}
            {i + 1} / {n}
          </span>
          <button type="button" onClick={() => go(1)} className="meta flex min-h-11 items-center gap-3 text-[14px] tracking-[0.1em]">
            Next
            <ArrowRightIcon strokeWidth={1.6} size={22} />
          </button>
        </div>
      )}
    </section>
  );
}
