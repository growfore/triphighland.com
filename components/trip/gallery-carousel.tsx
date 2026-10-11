"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Photo from "@/components/site/photo";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export type Slide = { src: string; caption?: string };

// Peek carousel: the current photo centred with slivers of the previous and
// next from sm up. Slides follow the finger/mouse when dragged (Embla).
export default function GalleryCarousel({ slides }: { slides: Slide[] }) {
  const n = slides.length;
  const [ref, api] = useEmblaCarousel({ loop: n > 1, align: "center", watchDrag: n > 1 });
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setI(api.selectedScrollSnap());
    api.on("select", onSelect).on("reInit", onSelect);
    return () => {
      api.off("select", onSelect).off("reInit", onSelect);
    };
  }, [api]);

  const prev = useCallback(() => api?.scrollPrev(), [api]);
  const next = useCallback(() => api?.scrollNext(), [api]);

  if (!n) return null;
  const cur = slides[i] ?? slides[0];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Trip photos"
      className="overflow-hidden pt-10 outline-none lg:pt-14"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
    >
      <div ref={ref} className="cursor-grab overflow-hidden active:cursor-grabbing">
        <div className="flex h-[300px] touch-pan-y sm:h-[480px] lg:h-[640px]">
          {slides.map((s, k) => (
            <figure
              key={s.src}
              aria-roledescription="slide"
              aria-label={`${k + 1} / ${n}`}
              aria-hidden={k !== i}
              // Clicking a peeking neighbour brings it to the centre.
              onClick={() => k !== i && api?.scrollTo(k)}
              className="relative m-0 min-w-0 flex-[0_0_100%] bg-stone sm:ml-3 sm:flex-[0_0_64%]"
            >
              <Photo src={s.src} alt={s.caption ?? ""} sizes="(min-width: 640px) 64vw, 100vw" />
            </figure>
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className="wrap flex items-center justify-between gap-5 pt-5">
          <button type="button" onClick={prev} className="meta flex min-h-11 items-center gap-3 text-[14px] tracking-[0.1em]">
            <ArrowLeftIcon strokeWidth={1.6} size={22} />
            Prev
          </button>
          <span className="text-center text-base text-ink-muted" aria-live="polite">
            {cur.caption ? `${cur.caption} · ` : ""}
            {i + 1} / {n}
          </span>
          <button type="button" onClick={next} className="meta flex min-h-11 items-center gap-3 text-[14px] tracking-[0.1em]">
            Next
            <ArrowRightIcon strokeWidth={1.6} size={22} />
          </button>
        </div>
      )}
    </section>
  );
}
