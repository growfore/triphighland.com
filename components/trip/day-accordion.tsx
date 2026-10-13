"use client";

import { useEffect, useState } from "react";
import type { ItineraryDay } from "@/lib/site";
import type { Labels } from "@/lib/labels";
import Photo from "@/components/site/photo";
import { richContent } from "@/lib/rich-content";
import { ChevronDownIcon } from "lucide-react";

export default function DayAccordion({ days, labels }: { days: ItineraryDay[]; labels: Labels["trip"] }) {
  const [open, setOpen] = useState<number | null>(days[0]?.day ?? null);

  // "Day N" links in the at-a-glance list point at #day-N.
  useEffect(() => {
    const onHash = () => {
      const m = window.location.hash.match(/^#day-(\d+)$/);
      if (m) setOpen(Number(m[1]));
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div className="border-t border-line">
      {days.map((d) => {
        const isOpen = open === d.day;
        const images = (d.dayFeaturedImages ?? []).filter((img) => img.image);
        const facts = [
          [labels.duration, d.duration],
          ["Distance", d.distance],
          ["Ascent", d.ascent],
          ["Descent", d.descent],
          [labels.accommodation, d.accommodations?.join(", ")],
          [labels.meals, d.meals?.join(", ")],
        ].filter(([, v]) => v) as [string, string][];

        return (
          <div key={d.day} id={`day-${d.day}`} className="scroll-mt-24 border-b border-line">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`day-panel-${d.day}`}
              onClick={() => setOpen(isOpen ? null : d.day)}
              className="flex w-full items-center gap-4 py-6 text-left transition-colors hover:bg-[#E4E1D8] sm:gap-5 sm:py-[30px]"
            >
              <span className="h-row flex-1 text-base sm:text-[clamp(17px,1.4vw,21px)]">{d.title}</span>
              <span className={`flex size-11 flex-none items-center justify-center transition-transform ${isOpen ? "rotate-180" : ""}`}>
                <ChevronDownIcon size={28} strokeWidth={1.6} />
              </span>
            </button>
            {isOpen && (
              <div id={`day-panel-${d.day}`} className="flex flex-wrap gap-x-16 gap-y-8 pb-12 pt-2 lg:pb-15">
                {/* The day's own photos, captioned exactly as entered in the dashboard. */}
                {images.length > 0 && (
                  <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-6 lg:flex-[1_1_420px]">
                    {images.map((img, i) => (
                      <figure key={img.image + i} className="m-0">
                        <div className={`relative overflow-hidden ${i === 0 ? "aspect-[4/3]" : "aspect-[16/9]"}`}>
                          <Photo src={img.image} alt={img.title ?? ""} sizes="(min-width: 1024px) 40vw, 100vw" />
                        </div>
                        {(img.title || img.description) && (
                          <figcaption className="mt-3 text-[14px] leading-snug text-ink-muted">
                            {img.title && <span className="font-medium text-ink">{img.title}</span>}
                            {img.title && img.description && " — "}
                            {img.description}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
                <div className="min-w-0 flex-[1_1_520px]">
                  {d.description && (
                    <div className="rich text-base sm:text-[17px]" dangerouslySetInnerHTML={{ __html: richContent(d.description) }} />
                  )}
                  {facts.length > 0 && (
                    <dl className={`flex flex-wrap gap-x-12 gap-y-5 ${d.description ? "mt-7" : ""}`}>
                      {facts.map(([k, v]) => (
                        <div key={k}>
                          <dt className="meta text-[12px] text-ink-muted">{k}</dt>
                          <dd className="mt-1 text-base font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
