import type { ReactNode } from "react";
import PlanTripCard from "./plan-trip-card";
import type { PageHeaderFields } from "@/lib/site-content";
import { richContent } from "@/lib/rich-content";
import Photo from "./photo";

// Inner-page masthead: night band with uppercase title, or a photo split when
// an image is set. `fields` is the page's dashboard header (pageHeaders.*);
// the other props are what the page shows when a field is empty.
export default function PageHeader({
  fields,
  eyebrow,
  title,
  standfirst,
  image,
  children,
}: {
  fields?: PageHeaderFields;
  eyebrow?: string;
  title: ReactNode;
  standfirst?: ReactNode;
  image?: string | null;
  children?: ReactNode;
}) {
  const img = fields?.image || image;
  const sub = fields?.subtitle || standfirst;
  const eye = fields?.eyebrow || eyebrow;
  return (
    <>
      <section className="flex flex-wrap bg-night text-white">
        <div
          className={`flex min-w-0 flex-col justify-end px-4 pb-12 pt-14 sm:px-[clamp(20px,4vw,64px)] lg:pb-18 lg:pt-24 ${img ? "flex-[1_1_520px] lg:min-h-[520px]" : "mx-auto w-full max-w-[1440px]"}`}
        >
          {eye && <p className="kicker mb-4 text-night-muted">{eye}</p>}
          <h1 className="display-hero max-w-[1000px] text-[44px] sm:text-[clamp(56px,6vw,96px)]">{fields?.title || title}</h1>
          {sub && <p className="mt-6 max-w-[640px] text-base font-light leading-relaxed text-[#DCE5EE] sm:text-lg">{sub}</p>}
          {children}
        </div>
        {img && (
          <div className="relative min-h-[280px] min-w-0 flex-[1_1_520px]">
            <Photo src={img} alt="" sizes="(min-width: 1040px) 50vw, 100vw" priority />
          </div>
        )}
      </section>
    </>
  );
}

// pageHeaders.*.content: optional rich text shown after the page's main list.
// On large screens it takes the left half; the right half carries the
// planning CTA (pinned while long copy scrolls).
export async function PageFooterContent({ fields }: { fields?: PageHeaderFields }) {
  if (!fields?.content) return null;
  return (
    <section className="wrap pb-16 lg:pb-24">
      <div className="grid gap-x-20 gap-y-14 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rich max-w-[760px]" dangerouslySetInnerHTML={{ __html: richContent(fields.content) }} />
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PlanTripCard image={fields.image} />
        </div>
      </div>
    </section>
  );
}
