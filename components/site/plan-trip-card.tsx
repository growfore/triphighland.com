import Link from "next/link";
import { getSiteConfig, getTrips } from "@/lib/site";
import { getLabels } from "@/lib/labels";
import Photo from "./photo";

// "Plan your trip" CTA styled like the homepage hero card: a tilted, translucent
// paper card laid on a photo. Full size beside page footer copy; `compact` for
// article sidebars, where it sits under the table of contents.
export default async function PlanTripCard({ image, compact }: { image?: string | null; compact?: boolean }) {
  const config = await getSiteConfig();
  const labels = getLabels(config.content);
  const photo = image || config.content.home?.hero?.image || config.image || (await getTrips({ limit: 1 })).trips[0]?.images[0];
  return (
    <section
      aria-label="Plan your trip"
      className={`relative flex items-end overflow-hidden bg-night ${compact ? "min-h-[360px] p-3" : "min-h-[460px] p-4 sm:p-6 lg:min-h-[560px]"}`}
    >
      <Photo src={photo} alt="" sizes={compact ? "(min-width: 1024px) 400px, 100vw" : "(min-width: 1024px) 45vw, 100vw"} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0)_45%,rgba(14,12,10,.45)_100%)]" />
      <div
        className={`relative w-full origin-bottom-left bg-paper/80 text-ink shadow-[0_18px_48px_-12px_rgba(14,12,10,.45)] backdrop-blur-[6px] backdrop-saturate-150 md:-rotate-[1.2deg] ${
          compact ? "p-5" : "p-6 sm:p-8"
        }`}
      >
        <p className="kicker text-ink-soft">Your trip, your way</p>
        <h2 className={compact ? "display mt-1.5 text-[22px] leading-tight" : "h-sub mt-2"}>Not sure where to start?</h2>
        <p className={`text-pretty font-light text-ink-soft ${compact ? "mt-2 text-[15px]" : "mt-3 text-base"}`}>
          Tell us your dates, pace and the views you&apos;re after. Our local team will shape an itinerary around you.
        </p>
        <div className={`flex flex-wrap items-center gap-3 ${compact ? "mt-4" : "mt-6"}`}>
          <Link href="/design-your-trip" className="btn-primary">
            {config.content.nav?.bookNow || "Customize your trip"}
          </Link>
          <button type="button" data-enquire className="btn-outline">
            {labels.trip.talkToExpert}
          </button>
        </div>
      </div>
    </section>
  );
}
