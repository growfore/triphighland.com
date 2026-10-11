"use client";

import { useState } from "react";
import Photo from "@/components/site/photo";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export type Slide = { src: string; caption?: string };

// Peek carousel: the current photo with slivers of the previous and next.
export default function GalleryCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  if (!n) return null;
  const at = (k: number) => slides[((k % n) + n) % n];
  const cur = at(i);

  return (
    <section aria-roledescription="carousel" aria-label="Trip photos" className="overflow-hidden pt-10 lg:pt-14">
      <div className="flex h-[300px] items-stretch gap-3 sm:h-[480px] lg:h-[640px]">
        {n > 1 && (
          <div className="relative hidden flex-[0_0_18%] overflow-hidden sm:block">
            <Photo src={at(i - 1).src} alt="" sizes="18vw" />
          </div>
        )}
        <figure className="relative m-0 flex-1 overflow-hidden">
          <Photo src={cur.src} alt={cur.caption ?? ""} sizes="(min-width: 640px) 64vw, 100vw" />
        </figure>
        {n > 1 && (
          <div className="relative hidden flex-[0_0_18%] overflow-hidden sm:block">
            <Photo src={at(i + 1).src} alt="" sizes="18vw" />
          </div>
        )}
      </div>
      {n > 1 && (
        <div className="wrap flex items-center justify-between gap-5 pt-5">
          <button type="button" onClick={() => setI(i - 1)} className="meta flex min-h-11 items-center gap-3 text-[14px] tracking-[0.1em]">
            <ArrowLeftIcon strokeWidth={1.6} size={22} />
            Prev
          </button>
          <span className="text-center text-base text-ink-muted" aria-live="polite">
            {cur.caption ? `${cur.caption} · ` : ""}
            {((i % n) + n) % n + 1} / {n}
          </span>
          <button type="button" onClick={() => setI(i + 1)} className="meta flex min-h-11 items-center gap-3 text-[14px] tracking-[0.1em]">
            Next
            <ArrowRightIcon strokeWidth={1.6} size={22} />
          </button>
        </div>
      )}
    </section>
  );
}
