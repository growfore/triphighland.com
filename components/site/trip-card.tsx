import Link from "next/link";
import type { TripSummary } from "@/lib/site";
import type { CardLabels } from "@/lib/labels";
import { formatAltitude, formatGrade, formatPrice } from "@/lib/media";
import Photo from "./photo";

export function tripMeta(trip: Pick<TripSummary, "duration" | "maximumAltitude" | "difficultyLevel">) {
  return [trip.duration, formatAltitude(trip.maximumAltitude), formatGrade(trip.difficultyLevel)]
    .filter(Boolean)
    .join(" · ");
}

export function PriceFrom({ price, labels, className }: { price?: number | null; labels: CardLabels; className?: string }) {
  return (
    <span className={`meta text-[14px] leading-tight tracking-[0.06em] ${className ?? ""}`}>
      {price == null ? (
        labels.priceOnRequest
      ) : (
        <>
          {labels.from} {formatPrice(price, labels.currency)}
          <br />
          <span className="font-sans text-sm normal-case tracking-normal opacity-70">{labels.perPerson}</span>
        </>
      )}
    </span>
  );
}

// Lonely Planet-style card: square-cornered 4:3 photo, typewriter meta line,
// uppercase title, outlined "View itinerary" and the starting price.
// `size` is accepted for older call sites; cards now share one compact size.
export default function TripCard({ trip, labels }: { trip: TripSummary; labels: CardLabels; size?: "lg" | "md" }) {
  return (
    <Link href={`/trip/${trip.slug}`} className="ht-card flex w-full flex-col text-ink">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Photo src={trip.images[0]} alt={trip.title} sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" />
      </div>
      <div className="meta mt-4 text-[12px]">{tripMeta(trip)}</div>
      <h3 className="display mt-2 text-[17px] leading-snug">{trip.title}</h3>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5">
        <span className="btn-mono px-4 py-2 text-[12px]">{labels.viewItinerary}</span>
        <PriceFrom price={trip.price} labels={labels} />
      </div>
    </Link>
  );
}
