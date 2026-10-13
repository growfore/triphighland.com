"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Photo from "@/components/site/photo";
import { ChevronDownIcon, PauseIcon, PlayIcon } from "lucide-react";

const reducedMotionQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");
function subscribeReducedMotion(cb: () => void) {
  const q = reducedMotionQuery();
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
}

export type HeroSlide = { slug: string; title: string; description?: string; image?: string };

// Fullscreen crossfade slider of featured trips: photo, title, blurb, the two
// CTAs (details / booking with the trip preselected), dots, and a scroll cue.
export default function HeroSlider({
  slides,
  eyebrow,
  viewLabel,
  bookLabel,
}: {
  slides: HeroSlide[];
  eyebrow?: string;
  viewLabel: string;
  bookLabel: string;
}) {
  const [i, setI] = useState(0);
  // WCAG 2.2.2: auto-advancing content needs a pause control. Reduced-motion
  // visitors start paused; hover or keyboard focus inside also holds the slide.
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => reducedMotionQuery().matches, () => false);
  const [toggled, setToggled] = useState<boolean | null>(null);
  const paused = toggled ?? reducedMotion;
  const [held, setHeld] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const n = slides.length;

  useEffect(() => {
    if (n < 2 || paused || held) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 3000);
    return () => clearInterval(t);
  }, [n, paused, held]);

  const s = slides[i];

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Featured trips"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
      // Fill the first screen below the sticky header so dots and scroll cue sit above the fold.
      className="relative min-h-[calc(100svh-3.5rem)] overflow-hidden bg-night text-white lg:min-h-[calc(100svh-4rem)]"
    >
      {slides.map((slide, k) => (
        <div
          key={slide.slug}
          aria-hidden={k !== i}
          inert={k !== i}
          className={`absolute inset-0 transition-opacity duration-700 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {/* Uploads are already web-sized WebP; re-encoding only loses detail at full-screen size. */}
          <Photo src={slide.image} alt={slide.title} sizes="100vw" priority={k === 0} position="50% 40%" original />
          {/* Light scrim: the text sits on a solid card, so the photo only needs a soft base shade. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0)_55%,rgba(14,12,10,.45)_100%)]" />
        </div>
      ))}

      <div className="wrap relative z-10 flex min-h-[calc(100svh-3.5rem)] items-end pb-24 pt-24 sm:pb-12 lg:min-h-[calc(100svh-4rem)] lg:pb-16">
        {/* Wide and short: on large screens title and copy sit side by side instead of stacking. */}
        {/* Translucent so the photo reads through; the light blur keeps text legible over busy detail. */}
        <div className="w-full max-w-[960px] origin-bottom-left md:-rotate-[1.2deg] bg-paper/75 text-ink shadow-[0_18px_48px_-12px_rgba(14,12,10,.35)] backdrop-blur-[6px] backdrop-saturate-150">
          <div aria-live={paused ? "polite" : "off"} className="grid gap-x-10 p-6 sm:px-9 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end">
            {eyebrow && <p className="kicker mb-3 text-ink-soft lg:col-span-2">{eyebrow}</p>}
            <div>
              <h1 className="display-hero text-[42px] sm:text-[clamp(48px,4.4vw,68px)]">{s.title}</h1>
            </div>
            <div>
              {s.description && (
                <p className="mt-4 line-clamp-3 text-pretty text-base font-light text-ink-soft lg:mt-0">{s.description}</p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={`/trip/${s.slug}`} className="btn-primary">
                  {viewLabel}
                </Link>
                <Link href={`/booking?trip=${s.slug}`} className="btn-outline">
                  {bookLabel}
                </Link>
              </div>
            </div>
          </div>

          {n > 1 && (
            <div className="flex items-center gap-1 border-t border-ink/15 px-4 py-1 sm:px-7">
              {slides.map((slide, k) => (
                <button
                  key={slide.slug}
                  type="button"
                  onClick={() => setI(k)}
                  aria-label={`Show ${slide.title}`}
                  aria-current={k === i ? "true" : undefined}
                  // 24px hit area around a thin bar marker.
                  className="group flex size-6 items-center justify-center"
                >
                  <span className="h-[3px] w-4 bg-ink/25 transition-[width,background-color] duration-300 group-hover:bg-ink-soft group-aria-current:w-7 group-aria-current:bg-ink" />
                </button>
              ))}
              <span className="meta ml-auto text-[11px] tabular-nums text-ink-soft">
                {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => setToggled(!paused)}
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                className="flex size-8 items-center justify-center text-ink-soft transition-colors hover:text-ink"
              >
                {paused ? <PlayIcon size={14} fill="currentColor" /> : <PauseIcon size={14} fill="currentColor" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Scroll down"
        onClick={() => sectionRef.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-12 right-[clamp(16px,4vw,64px)] z-10 hidden size-11 items-center justify-center text-white/85 transition-colors hover:text-white motion-safe:animate-[drift_2.8s_cubic-bezier(.45,0,.55,1)_infinite] xl:flex"
      >
        <ChevronDownIcon size={26} strokeWidth={1.6} />
      </button>
    </section>
  );
}
