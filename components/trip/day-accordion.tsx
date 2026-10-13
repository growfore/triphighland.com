import type { ItineraryDay } from "@/lib/site";
import type { Labels } from "@/lib/labels";
import Photo from "@/components/site/photo";
import { richContent } from "@/lib/rich-content";
import { ChevronDownIcon } from "lucide-react";

// Native <details> rows, rendered on the server: every day's content ships in the
// HTML (crawlers see all of it), and rows open independently, so opening a day never
// collapses one above it and shifts the page.
export default function DayAccordion({ days, labels }: { days: ItineraryDay[]; labels: Labels["trip"] }) {
  return (
    <div className="border-t border-line">
      {days.map((d, idx) => {
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
          <details key={d.day} id={`day-${d.day}`} open={idx === 0} className="group scroll-mt-24 border-b border-line">
            <summary className="flex cursor-pointer list-none items-center gap-4 px-3 py-6 text-left transition-colors hover:bg-paper sm:gap-5 sm:px-5 sm:py-[30px] [&::-webkit-details-marker]:hidden">
              <h3 className="h-row flex-1 text-base sm:text-[clamp(17px,1.4vw,21px)]">{d.title}</h3>
              <span className="flex size-11 flex-none items-center justify-center transition-transform group-open:rotate-180">
                <ChevronDownIcon size={28} strokeWidth={1.6} />
              </span>
            </summary>
            <div className="flex flex-wrap gap-x-16 gap-y-8 px-3 pb-12 pt-2 sm:px-5 lg:pb-15">
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
                  <div className="rich rich-nested text-base sm:text-[17px]" dangerouslySetInnerHTML={{ __html: richContent(d.description) }} />
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
          </details>
        );
      })}
    </div>
  );
}
