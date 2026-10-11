"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Photo from "@/components/site/photo";
import { ChevronDownIcon } from "lucide-react";

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
  const sectionRef = useRef<HTMLElement | null>(null);
  const n = slides.length;

  useEffect(() => {
    if (n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 7000);
    return () => clearInterval(t);
  }, [n]);

  const s = slides[i];

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] overflow-hidden bg-night text-white">
      {slides.map((slide, k) => (
        <div
          key={slide.slug}
          aria-hidden={k !== i}
          className={`absolute inset-0 transition-opacity duration-700 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <Photo src={slide.image} alt={slide.title} sizes="100vw" priority={k === 0} position="50% 40%" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,.55)_0%,rgba(14,12,10,.2)_30%,rgba(14,12,10,.45)_65%,rgba(14,12,10,.82)_100%)]" />
        </div>
      ))}

      <div className="wrap relative z-10 flex min-h-[100svh] flex-col items-center justify-end pb-36 pt-28 text-center md:justify-center md:pb-32">
        {eyebrow && <p className="meta mb-5 text-[12px] text-white/85">{eyebrow}</p>}
        <h1 className="display max-w-4xl text-[30px] leading-[1.1] sm:text-[clamp(34px,3.9vw,58px)]">{s.title}</h1>
        {s.description && (
          <p className="mx-auto mt-5 max-w-[640px] text-base font-light text-white/90 sm:mt-7 sm:text-lg">{s.description.substring(0,300)}</p>
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
        <div className="absolute inset-x-0 bottom-16 z-10 flex justify-center gap-2.5">
          {slides.map((slide, k) => (
            <button
              key={slide.slug}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show ${slide.title}`}
              aria-current={k === i}
              className="size-2.5 rounded-full bg-white/40 transition-colors aria-current:bg-white"
            />
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label="Scroll down"
        onClick={() => sectionRef.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth" })}
        className="absolute inset-x-0 bottom-6 z-10 mx-auto flex size-11 w-fit animate-bounce items-center justify-center rounded-full text-white/80 transition-colors hover:text-white"
      >
        <ChevronDownIcon size={26} strokeWidth={1.6} />
      </button>
    </section>
  );
}
