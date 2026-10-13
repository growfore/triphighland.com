import type { Metadata } from "next";
import { getExtras, getSiteConfig, getTrip, getTrips } from "@/lib/site";
import { whatsappLink } from "@/lib/media";
import { getLabels } from "@/lib/labels";
import Photo from "@/components/site/photo";
import EnquiryForm from "@/components/site/enquiry-form";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const h = (await getSiteConfig()).content.pageHeaders?.booking;
  return { title: h?.metaTitle || "Enquire", description: h?.metaDescription || undefined, alternates: { canonical: "/booking" }, robots: { index: true, follow: true } };
}

// ?trip=<slug> preselects a journey (linked from trip pages and cards).
export default async function BookingPage({ searchParams }: { searchParams: Promise<{ trip?: string }> }) {
  const { trip: tripSlug } = await searchParams;
  const [config, { trips }] = await Promise.all([getSiteConfig(), getTrips({ limit: 50 })]);
  const header = config.content.pageHeaders?.booking;
  const selected = trips.find((t) => t.slug === tripSlug);
  const sorted = [...trips].sort((a, b) => a.title.localeCompare(b.title));
  // A preselected trip's add-ons render with the page; other journeys load theirs when picked.
  const detail = selected ? await getTrip(selected.slug) : null;
  const extras = detail?.extraIds.length ? await getExtras() : [];
  const addons = (detail?.extraIds ?? []).flatMap((id) => extras.filter((e) => e.id === id)).map((e) => ({ name: e.name, price: e.price }));

  return (
    <main className="bg-night text-paper">
      <div className="mx-auto flex max-w-[1440px] flex-wrap">
        <div className="relative min-h-[300px] min-w-0 flex-[1_1_480px] lg:min-h-[calc(100vh-64px)]">
          <Photo src={selected?.images[0] || header?.image || config.image} alt="" sizes="(min-width: 1024px) 50vw, 100vw" priority />
        </div>
        <div className="min-w-0 flex-[1_1_520px] px-4 py-14 sm:px-[clamp(20px,5vw,96px)] sm:py-[clamp(48px,6vw,112px)]">
          {header?.eyebrow && <p className="kicker mb-4 text-night-muted">{header.eyebrow}</p>}
          <h1 className="display text-[30px] leading-[1.1] sm:text-[clamp(26px,2.5vw,38px)]">
            {header?.title || selected?.title || getLabels(config.content).trip.bookNow}
          </h1>
          {header?.subtitle && <p className="mt-5 max-w-[460px] text-base font-light text-night-muted">{header.subtitle}</p>}
          <div className="mt-10">
            <EnquiryForm
              trips={sorted.map((t) => t.title)}
              defaultTrip={selected?.title}
              addons={addons}
              tripSlugs={Object.fromEntries(trips.map((t) => [t.title, t.slug]))}
              currency={config.content.tripCard?.currency || "$"}
              whatsapp={whatsappLink(config.whatsAppNumber)}
              labels={getLabels(config.content).trip}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
