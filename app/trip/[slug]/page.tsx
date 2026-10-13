import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCities, getCountries, getDepartures, getExtras, getSiteConfig, getTrip, getTrips } from "@/lib/site";
import { formatAltitude, formatGrade, formatPrice, imageUrl, isApiMedia, stripHtml } from "@/lib/media";
import { getLabels } from "@/lib/labels";
import { plainContent, richContent } from "@/lib/rich-content";
import Photo from "@/components/site/photo";
import TripCard from "@/components/site/trip-card";
import { BedDoubleIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon, ClockIcon, FlagIcon, LanguagesIcon, MapPinIcon, MountainIcon, SlidersHorizontalIcon, UserIcon, UtensilsIcon, XIcon } from "lucide-react";
import GalleryCarousel from "@/components/trip/gallery-carousel";
import DayAccordion from "@/components/trip/day-accordion";
import OverviewMore from "@/components/trip/overview-more";
import VideoIntro from "@/components/trip/video-intro";
import TripPeek from "@/components/trip/trip-peek";
import { parseVideo } from "@/lib/video";
import JsonLd from "@/components/site/json-ld";
import { absolute, absoluteMedia, breadcrumbLd, siteUrl } from "@/lib/seo";

export const revalidate = 300;

// Render each slug on first request, then serve it from cache (ISR).
export async function generateStaticParams() {
  return [];
}

// Overviews longer than this get the clipped preview + "Show more" dialog.
const OVERVIEW_PREVIEW_CHARS = 280;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) return {};
  const description = trip.seo?.metaDescription || stripHtml(trip.overview).slice(0, 160);
  const image = trip.seo?.featuredMedia || trip.images[0];
  return {
    title: trip.seo?.metaTitle || trip.title,
    description,
    alternates: { canonical: `/trip/${slug}` },
    openGraph: { title: trip.title, description, images: image ? [{ url: imageUrl(image) }] : undefined },
  };
}

export default async function TripPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) notFound();

  const [config, countries, cities, { trips }, extras, departures] = await Promise.all([
    getSiteConfig(),
    getCountries(),
    getCities(),
    getTrips({ limit: 12 }),
    trip.extraIds.length ? getExtras() : Promise.resolve([]),
    getDepartures(trip.id),
  ]);
  // Keep the trip's own order of add-ons; ids missing from the catalogue drop out.
  const addons = trip.extraIds.flatMap((id) => extras.filter((e) => e.id === id));
  const country = countries.find((c) => c.id === trip.countryId);
  const city = cities.find((c) => c.id === trip.cityId);
  const related = trips.filter((t) => t.slug !== trip.slug).slice(0, 3);
  const L = getLabels(config.content);
  const overviewText = plainContent(trip.overview);

  const slides = [
    ...trip.images.map((src) => ({ src })),
    ...trip.itinerary.flatMap((d) => (d.dayFeaturedImages ?? []).map((f) => ({ src: f.image, caption: f.title }))),
  ].filter((s, i, all) => s.src && all.findIndex((x) => x.src === s.src) === i);

  const startPoint = trip.meetingPoint || city?.cityName;
  const facts: { k: string; v?: string | null; Icon: typeof MapPinIcon }[] = [
    { k: L.trip.startPoint, v: startPoint || country?.countryName, Icon: MapPinIcon },
    { k: L.trip.endPoint, v: trip.dropOffPoint && trip.dropOffPoint !== startPoint ? trip.dropOffPoint : "", Icon: FlagIcon },
    { k: L.trip.duration, v: trip.duration, Icon: ClockIcon },
    { k: L.trip.maxAltitude, v: formatAltitude(trip.maximumAltitude), Icon: MountainIcon },
    { k: L.trip.difficulty, v: formatGrade(trip.difficultyLevel), Icon: SlidersHorizontalIcon },
    { k: L.trip.groupSize, v: trip.guestCapacity ? String(trip.guestCapacity) : undefined, Icon: UserIcon },
    { k: L.trip.accommodation, v: trip.accommodations.join(", "), Icon: BedDoubleIcon },
    { k: L.trip.meals, v: trip.meals.join(", "), Icon: UtensilsIcon },
    { k: L.trip.languages, v: trip.languages.join(", "), Icon: LanguagesIcon },
  ];
  const summary = facts.filter((x): x is { k: string; v: string; Icon: typeof MapPinIcon } => Boolean(x.v));
  const priceRange = trip.price != null && trip.maxPrice != null && trip.maxPrice > trip.price;
  const hasVideo = Boolean(parseVideo(trip.videoIntro));
  const routeMap = imageUrl(trip.routeMap);

  // "$" → USD; a three-letter code is used as-is; anything else drops the Offer.
  const currencyCode = L.card.currency === "$" ? "USD" : /^[A-Z]{3}$/.test(L.card.currency) ? L.card.currency : undefined;
  const tripLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.title,
    description: trip.seo?.metaDescription || overviewText.slice(0, 300) || undefined,
    url: absolute(config, `/trip/${trip.slug}`),
    image: trip.images.slice(0, 6).map((src) => absoluteMedia(config, src)),
    provider: { "@id": `${siteUrl(config)}/#organization` },
    itinerary: trip.itinerary.length
      ? {
          "@type": "ItemList",
          numberOfItems: trip.itinerary.length,
          itemListElement: trip.itinerary.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: d.title})),
        }
      : undefined,
    offers:
      trip.price != null && currencyCode
        ? {
            "@type": "Offer",
            price: trip.price,
            priceCurrency: currencyCode,
            availability: "https://schema.org/InStock",
            url: absolute(config, `/trip/${trip.slug}`),
          }
        : undefined,
  };

  return (
    // Read by the site-wide enquiry sheet to pre-fill this trip.
    <main data-enquiry-trip={trip.title} data-enquiry-addons={JSON.stringify(addons.map((a) => ({ name: a.name, price: a.price })))}>
      <JsonLd
        data={[
          tripLd,
          breadcrumbLd(config, [
            { name: "Home", path: "/" },
            { name: "Explore", path: "/explore" },
            { name: trip.title, path: `/trip/${trip.slug}` },
          ]),
        ]}
      />
      {/* SPLIT HERO */}
      <section id="trip-hero" className="flex flex-wrap bg-night text-white">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col px-4 pb-12 pt-8 sm:px-[clamp(20px,4vw,64px)] lg:min-h-[720px] lg:pb-18 lg:pt-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 self-start text-sm text-white/70">
            <Link href="/explore" className="transition-colors hover:text-white">
              {config.content.pageHeaders?.explore?.title || "Explore"}
            </Link>
            {country && (
              <>
                <ChevronRightIcon strokeWidth={2} size={14} className="text-white/40" />
                <Link href={`/explore?country=${country.countryHandle}`} className="transition-colors hover:text-white">
                  {country.countryName}
                </Link>
              </>
            )}
            {city && (
              <>
                <ChevronRightIcon strokeWidth={2} size={14} className="text-white/40" />
                <Link href={`/explore?city=${city.cityHandle}`} className="transition-colors hover:text-white">
                  {city.cityName}
                </Link>
              </>
            )}
          </nav>
          <div className="mt-16 lg:mt-auto">
            <h1 className="display-hero text-[42px] sm:text-[clamp(52px,4.6vw,76px)]">{trip.title}</h1>
            {overviewText &&
              (overviewText.length > OVERVIEW_PREVIEW_CHARS ? (
                <OverviewMore title={L.trip.overview} html={richContent(trip.overview)} preview={overviewText} />
              ) : (
                <p className="mt-6 max-w-[620px] text-base font-light leading-relaxed text-[#DCE5EE] sm:text-lg">{overviewText}</p>
              ))}
            {summary.length > 0 && (
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/20 pt-6 sm:grid-cols-3">
                {summary.map(({ k, v, Icon }) => (
                  <div key={k}>
                    <dt className="meta flex items-center gap-2 text-[11px] text-night-muted">
                      <Icon size={15} strokeWidth={2} className="flex-none opacity-70" />
                      {k}
                    </dt>
                    <dd className="mt-1 pl-[23px] text-base font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
        <div className="relative min-h-[320px] min-w-0 flex-[1_1_520px] lg:min-h-[560px]">
          <Photo src={trip.images[0]} alt={trip.title} sizes="(min-width: 1040px) 50vw, 100vw" priority />
        </div>
      </section>

      <GalleryCarousel slides={slides} />

      {/* HIGHLIGHTS */}
      {trip.highlights.length > 0 && (
        <section className="wrap py-16 lg:py-28">
          <h2 className="h-sub text-night">{L.trip.highlights}</h2>
          <ul className="mt-8 list-disc space-y-2.5 pl-5 text-base leading-relaxed marker:text-highland-deep sm:text-[17px]">
            {trip.highlights.map((h) => (
              <li key={h} className="pl-1">
                {h}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* INTRO VIDEO */}
      {hasVideo && (
        <section className="wrap pb-16 lg:pb-24">
          <div className="max-w-[1080px]">
            <VideoIntro url={trip.videoIntro} title={trip.title} fallbackPoster={trip.images[1] ?? trip.images[0]} />
          </div>
        </section>
      )}

      {/* DAY BY DAY */}
      {trip.itinerary.length > 0 && (
        <section id="itinerary" className="band-stone bg-[#ECEAE3]">
          <div className="wrap pb-16 pt-14 lg:pb-28 lg:pt-25">
            {/* With a route map, days and map sit side by side on large screens and the
                map stays pinned below the sticky trip bar while the days scroll. */}
            <div className={routeMap ? "grid gap-x-14 gap-y-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]" : ""}>
              <div className="min-w-0">
                <h2 className="h-sub text-night mb-9">{L.trip.itinerary}</h2>
                <DayAccordion days={trip.itinerary} labels={L.trip} />
              </div>
              {routeMap && (
                // lg:mt matches the Itinerary heading block so the map lines up with the first day.
                <div
                  id="route-map"
                  aria-label={L.trip.routeMap}
                  className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:mt-[calc(1.1*clamp(26px,2.5vw,38px)+2.25rem)] lg:self-start"
                >
                  <RouteMap src={routeMap} alt={`${trip.title} ${L.trip.routeMap.toLowerCase()}`} />
                </div>
              )}
            </div>

            {L.trip.note && (
              <div className="mt-16 flex flex-wrap items-center justify-between gap-8 bg-highland p-8 text-[#0E1F2E] sm:p-[clamp(40px,5vw,64px)]">
                <p className="max-w-[760px] text-xl font-semibold leading-snug tracking-[-0.01em] sm:text-[clamp(21px,1.8vw,26px)]">
                  {L.trip.note}
                </p>
                <a href="#enquire" className="btn meta bg-[#0E1F2E] px-9 py-5 text-[14px] tracking-[0.1em] text-white hover:bg-black">
                  {L.trip.talkToExpert}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ROUTE MAP — natural aspect ratio, never cropped; opens full size */}
      {routeMap && trip.itinerary.length === 0 && (
        <section id="route-map" aria-label={L.trip.routeMap} className="wrap py-16 lg:py-24">
          <RouteMap src={routeMap} alt={`${trip.title} ${L.trip.routeMap.toLowerCase()}`} />
        </section>
      )}

      {/* DEPARTURES */}
      {departures.length > 0 && (
        <section id="departures" className="wrap py-16 lg:py-24">
          <h2 className="h-sub text-night">{L.trip.departures}</h2>
          <ul className="mt-9 border-t border-line">
            {departures.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-line py-5 sm:py-6">
                <p className="display min-w-0 flex-[1_1_260px] text-base sm:text-[clamp(17px,1.5vw,20px)]">
                  <time dateTime={d.startDate.slice(0, 10)}>{formatDate(d.startDate)}</time>
                  <span className="text-ink-muted"> – </span>
                  <time dateTime={d.endDate.slice(0, 10)}>{formatDate(d.endDate)}</time>
                </p>
                <p className="meta flex-none text-[12px] text-ink-muted">
                  {d.availableSpots} {d.availableSpots === 1 ? "spot" : "spots"} left
                </p>
                {d.price != null && (
                  <p className="m-0 flex-none text-sm text-ink-muted">
                    <span className="text-base font-semibold tracking-[-0.02em] text-ink">{formatPrice(d.price, L.card.currency)}</span>{" "}
                    {L.card.perPerson}
                  </p>
                )}
                <button type="button" data-enquire data-enquiry-date={d.startDate.slice(0, 10)} className="btn-mono flex-none px-4 py-2 text-[12px]">
                  {L.trip.talkToExpert}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* INCLUDED / EXCLUDED — side by side on large screens when both exist */}
      {(trip.inclusions.length > 0 || trip.exclusions.length > 0) && (
        <section
          className={`wrap grid gap-6 py-16 lg:py-24 ${trip.inclusions.length > 0 && trip.exclusions.length > 0 ? "lg:grid-cols-2" : ""}`}
        >
          {trip.inclusions.length > 0 && (
            <div className="bg-success-tint p-6 sm:p-9">
              <h2 className="h-sub text-night">{L.trip.included}</h2>
              <ul className="mt-6 flex flex-col">
                {trip.inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-4 py-2.5 text-base sm:text-[17px]">
                    <CheckIcon strokeWidth={2.2} size={20} className="mt-1 flex-none text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {trip.exclusions.length > 0 && (
            <div className="bg-rose-wash p-6 sm:p-9">
              <h2 className="h-sub text-night">{L.trip.excluded}</h2>
              <ul className="mt-6 flex flex-col">
                {trip.exclusions.map((item) => (
                  <li key={item} className="flex items-start gap-4 py-2.5 text-base sm:text-[17px]">
                    <XIcon strokeWidth={2.2} size={20} className="mt-1 flex-none text-destructive" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ADD-ONS */}
      {addons.length > 0 && (
        <section id="addons" className="border-t border-line-soft">
          <div className="wrap py-16 lg:py-24">
            <h2 className="h-sub text-night">{L.trip.addons}</h2>
            <ul className="mt-9 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {addons.map((a) => (
                <li key={a.id} className="flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden bg-stone">
                    <Photo src={a.images[0]} alt={a.name} sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw" />
                  </div>
                  {a.type && <p className="meta mt-4 text-[12px] text-ink-muted">{a.type.replace(/_/g, " ").toLowerCase()}</p>}
                  <h3 className="display mt-2 text-[17px] leading-snug">{a.name}</h3>
                  {a.description && <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{a.description}</p>}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5">
                    <button
                      type="button"
                      data-enquire
                      data-enquiry-addon={a.name}
                      className="btn-mono px-4 py-2 text-[12px]"
                    >
                      Ask about this
                    </button>
                    {a.price != null && (
                      <span className="meta text-[14px] tracking-[0.06em]">+ {formatPrice(a.price, L.card.currency)}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* GOOD TO KNOW + FAQ — stacked accordions, styled like the itinerary */}
      {(trip.additionalInfo.length > 0 || trip.faq.flatMap((g) => g.items ?? []).length > 0) && (
        <section className="band-stone bg-[#ECEAE3]">
          <div className="wrap flex flex-col gap-16 py-16 lg:py-24">
            {trip.additionalInfo.length > 0 && (
              <div>
                <h2 className="h-sub text-night mb-9">{L.trip.goodToKnow}</h2>
                <div className="border-t border-line">
                  {trip.additionalInfo.map((info) => (
                    <AccordionRow key={info.title} title={info.title} html={richContent(info.description)} />
                  ))}
                </div>
              </div>
            )}
            {trip.faq.flatMap((g) => g.items ?? []).length > 0 && (
              <div>
                <h2 className="h-sub text-night mb-9">Frequently Asked Questions</h2>
                {/* A lone "Default" (or untitled) group is just the plain list — no category heading. */}
                <div className="flex flex-col gap-12">
                  {trip.faq
                    .filter((g) => g.items?.length)
                    .map((g, i, groups) => {
                      const showTitle = g.title && !(groups.length === 1 && g.title.trim().toLowerCase() === "default");
                      return (
                        <div key={(g.title ?? "") + i}>
                          {showTitle && <h3 className="mb-6 text-[19px] font-semibold lg:text-[22px]">{g.title}</h3>}
                          <div className="border-t border-line">
                            {g.items.map((f) => (
                              <AccordionRow key={f.q} title={f.q} html={richContent(f.a)} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <section className="wrap py-16 lg:py-28">
          <h2 className="h-sub text-night mb-10 lg:mb-12">{config.content.sections?.featured?.title || config.content.pageHeaders?.explore?.title || "Explore"}</h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((t) => (
              <TripCard key={t.id} trip={t} labels={L.card} size="md" />
            ))}
          </div>
        </section>
      )}

      <TripPeek
        title={trip.title}
        from={trip.price != null ? L.card.from : undefined}
        price={
          trip.price != null
            ? formatPrice(trip.price, L.card.currency) + (priceRange ? ` – ${formatPrice(trip.maxPrice, L.card.currency)}` : "")
            : undefined
        }
        priceNote={L.card.perPerson}
        cta={L.trip.talkToExpert}
      />
    </main>
  );
}

// Departure dates are calendar days stored at UTC midnight; format in UTC so
// they don't shift a day for the server's or visitor's zone.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

// Route map at its natural aspect ratio, never cropped; opens full size.
function RouteMap({ src, alt }: { src: string; alt: string }) {
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block bg-white">
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        sizes="(min-width: 1024px) 45vw, 100vw"
        unoptimized={!isApiMedia(src)}
        className="h-auto w-full"
      />
    </a>
  );
}

// Accordion row matching the day-by-day itinerary rows.
function AccordionRow({ title, html }: { title: string; html: string }) {
  return (
    <details className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center gap-4 py-5 transition-colors hover:bg-[#E4E1D8] sm:py-6 [&::-webkit-details-marker]:hidden">
        <span className="h-row flex-1 text-base sm:text-[clamp(17px,1.4vw,21px)]">{title}</span>
        <span className="flex size-11 flex-none items-center justify-center transition-transform group-open:rotate-180">
          <ChevronDownIcon size={26} strokeWidth={1.6} />
        </span>
      </summary>
      <div className="rich pb-8 pt-1 text-base sm:text-[17px]" dangerouslySetInnerHTML={{ __html: html }} />
    </details>
  );
}
