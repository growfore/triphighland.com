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
    const t = setInterval(() => setI((x) => (x + 1) % n), 7000);
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
          <Photo src={slide.image} alt={slide.title} sizes="100vw" priority={k === 0} position="50% 40%" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,.45)_0%,rgba(14,12,10,.3)_28%,rgba(14,12,10,.55)_60%,rgba(14,12,10,.85)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_55%,rgba(14,12,10,.35),transparent)]" />
        </div>
      ))}

      <div
        aria-live={paused ? "polite" : "off"}
        className="wrap relative z-10 flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-end pb-36 pt-24 text-center [text-shadow:0_1px_12px_rgba(14,12,10,.35)] md:justify-center md:pb-32 lg:min-h-[calc(100svh-4rem)]"
      >
        {eyebrow && <p className="meta mb-5 max-w-[46ch] text-[12px] text-white">{eyebrow}</p>}
        <h1 className="display max-w-4xl text-balance text-[30px] leading-[1.1] sm:text-[clamp(34px,3.9vw,58px)]">{s.title}</h1>
        {s.description && (
          <p className="mx-auto mt-5 line-clamp-4 max-w-[640px] text-pretty text-base font-light text-white/90 sm:mt-7 sm:text-lg">{s.description}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href={`/trip/${s.slug}`} className="btn-primary">
            {viewLabel}
          </Link>
          <Link href={`/booking?trip=${s.slug}`} className="btn-outline-light">
            {bookLabel}
          </Link>
        </div>
      </div>

      {n > 1 && (
        <div className="absolute inset-x-0 bottom-16 z-10 flex items-center justify-center gap-1">
          {slides.map((slide, k) => (
            <button
              key={slide.slug}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show ${slide.title}`}
              aria-current={k === i ? "true" : undefined}
              // 24px hit area around a small square marker.
              className="group flex size-6 items-center justify-center"
            >
              <span className="h-[3px] w-4 bg-white/45 transition-[width,background-color] duration-300 group-hover:bg-white/80 group-aria-current:w-7 group-aria-current:bg-white" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setToggled(!paused)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="ml-2 flex size-8 items-center justify-center text-white/80 transition-colors hover:text-white"
          >
            {paused ? <PlayIcon size={14} fill="currentColor" /> : <PauseIcon size={14} fill="currentColor" />}
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="Scroll down"
        onClick={() => sectionRef.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth" })}
        className="absolute inset-x-0 bottom-4 z-10 mx-auto flex size-11 items-center justify-center text-white/80 transition-colors hover:text-white motion-safe:animate-[drift_2.8s_cubic-bezier(.45,0,.55,1)_infinite]"
      >
        <ChevronDownIcon size={26} strokeWidth={1.6} />
      </button>
    </section>
  );
}
