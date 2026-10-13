"use client";

import { useEffect, useState } from "react";

// Trip summary card that peeks up from the bottom-right corner: slightly tilted,
// its lower edge running off-screen. It waits until the hero (#trip-hero) has
// scrolled away and ducks out of sight while the footer is on screen.
export default function TripPeek({
  title,
  from,
  price,
  priceNote,
  cta,
}: {
  title: string;
  from?: string;
  price?: string;
  priceNote?: string;
  cta: string;
}) {
  const [pastHero, setPastHero] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("trip-hero");
    const footer = document.querySelector("footer");
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const o = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0));
      o.observe(hero);
      observers.push(o);
    }
    if (footer) {
      const o = new IntersectionObserver(([e]) => setFooterInView(e.isIntersecting));
      o.observe(footer);
      observers.push(o);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const visible = pastHero && !footerInView;

  return (
    <aside
      aria-label="Trip summary"
      data-trip-peek={visible ? "shown" : "hidden"}
      inert={!visible}
      className={`fixed inset-x-4 -bottom-4 z-30 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none sm:inset-x-auto sm:right-[clamp(16px,4vw,64px)] sm:w-[440px] ${
        visible ? "translate-y-0" : "translate-y-[calc(100%+24px)]"
      }`}
    >
      {/* The extra bottom padding sits below the screen edge, so the tilt never shows a gap. */}
      <div className="origin-bottom-right -rotate-[1.6deg] border border-b-0 border-line-soft bg-white px-6 pb-10 pt-5 shadow-[0_-18px_40px_-20px_rgba(26,23,20,.45)] transition-transform duration-300 hover:-translate-y-1 sm:px-7 sm:pt-6">
        <p className="display line-clamp-2 text-[17px] leading-snug sm:text-[20px]">{title}</p>
        <div className="mt-4 flex items-center justify-between gap-4">
          {price ? (
            <p className="m-0 text-[14px] text-ink-muted">
              {from && <>{from} </>}
              <span className="text-[18px] font-semibold tracking-[-0.02em] text-ink sm:text-[20px]">{price}</span>
              {priceNote && <> {priceNote}</>}
            </p>
          ) : (
            <span />
          )}
          <a href="#enquire" className="btn-primary flex-none px-6 text-[13px]">
            {cta}
          </a>
        </div>
      </div>
    </aside>
  );
}
