import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCities, getCountries, getSiteConfig, getTeam, getTrip, getTrips } from "@/lib/site";
import { formatAltitude, formatGrade, formatPrice, imageUrl, stripHtml, whatsappLink } from "@/lib/media";
import { getLabels } from "@/lib/labels";
import { plainContent, richContent } from "@/lib/rich-content";
import Photo from "@/components/site/photo";
import TripCard from "@/components/site/trip-card";
import EnquiryForm from "@/components/site/enquiry-form";
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  ClockIcon,
  CloseIcon,
  MountainIcon,
  PinIcon,
  SlidersIcon,
  UserIcon,
} from "@/components/site/icons";
import GalleryCarousel from "@/components/trip/gallery-carousel";
import DayAccordion from "@/components/trip/day-accordion";
import OverviewMore from "@/components/trip/overview-more";

export const revalidate = 300;

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

  const [config, countries, cities, { trips }, team] = await Promise.all([
    getSiteConfig(),
    getCountries(),
    getCities(),
    getTrips({ limit: 12 }),
    getTeam(),
  ]);
  const country = countries.find((c) => c.id === trip.countryId);
  const city = cities.find((c) => c.id === trip.cityId);
  const related = trips.filter((t) => t.slug !== trip.slug).slice(0, 3);
  const guide = team.flatMap((d) => d.members).find((m) => m.image) ?? team[0]?.members[0];
  const whatsapp = whatsappLink(config.whatsAppNumber, trip.title);
  const L = getLabels(config.content);
  const overviewText = plainContent(trip.overview);

  const slides = [
    ...trip.images.map((src) => ({ src })),
    ...trip.itinerary.flatMap((d) => (d.dayFeaturedImages ?? []).map((f) => ({ src: f.image, caption: f.title }))),
  ].filter((s, i, all) => s.src && all.findIndex((x) => x.src === s.src) === i);

  const facts: { k: string; v?: string | null; Icon: typeof PinIcon }[] = [
    { k: L.trip.startPoint, v: trip.meetingPoint || city?.cityName || country?.countryName, Icon: PinIcon },
    { k: L.trip.duration, v: trip.duration, Icon: ClockIcon },
    { k: L.trip.maxAltitude, v: formatAltitude(trip.maximumAltitude), Icon: MountainIcon },
    { k: L.trip.difficulty, v: formatGrade(trip.difficultyLevel), Icon: SlidersIcon },
    { k: L.trip.groupSize, v: trip.guestCapacity ? String(trip.guestCapacity) : undefined, Icon: UserIcon },
  ];
  const summary = facts.filter((x): x is { k: string; v: string; Icon: typeof PinIcon } => Boolean(x.v));

  return (
    <main>
      {/* SPLIT HERO */}
      <section className="flex flex-wrap bg-night text-white">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col px-4 pb-12 pt-8 sm:px-[clamp(20px,4vw,64px)] lg:min-h-[720px] lg:pb-18 lg:pt-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 self-start text-sm text-white/70">
            <Link href="/explore" className="transition-colors hover:text-white">
              {config.content.pageHeaders?.explore?.title || "Explore"}
            </Link>
            {country && (
              <>
                <ChevronRight size={14} className="text-white/40" />
                <Link href={`/explore?country=${country.countryHandle}`} className="transition-colors hover:text-white">
                  {country.countryName}
                </Link>
              </>
            )}
            {city && (
              <>
                <ChevronRight size={14} className="text-white/40" />
                <Link href={`/explore?city=${city.cityHandle}`} className="transition-colors hover:text-white">
                  {city.cityName}
                </Link>
              </>
            )}
          </nav>
          <div className="mt-16 lg:mt-auto">
            <h1 className="display text-[30px] leading-[1.1] sm:text-[clamp(31px,2.8vw,42px)]">{trip.title}</h1>
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

      {/* SUMMARY BAR */}
      <div className="sticky top-14 z-20 border-b border-line-soft bg-white lg:top-16">
        <div className="wrap flex items-center gap-4 py-3 sm:gap-8">
          <p className="display m-0 min-w-0 flex-1 truncate text-[14px] sm:text-base">{trip.title}</p>
          {trip.price != null && (
            <p className="m-0 hidden flex-none text-sm text-ink-muted sm:block">
              {L.card.from}{" "}
              <span className="text-base font-semibold tracking-[-0.02em] text-ink">{formatPrice(trip.price, L.card.currency)}</span>{" "}
              {L.card.perPerson}
            </p>
          )}
          <a href="#enquire" className="btn-primary meta min-h-11 flex-none px-5 py-2.5 text-[12px] tracking-[0.1em] sm:px-6">
            {L.trip.talkToExpert}
          </a>
        </div>
      </div>

      <GalleryCarousel slides={slides} />

      {/* HIGHLIGHTS */}
      {trip.highlights.length > 0 && (
        <section className="wrap py-16 lg:py-28">
          <h2 className="h-sub">{L.trip.highlights}</h2>
          <ul className="mt-8 max-w-[860px] list-disc space-y-2.5 pl-5 text-base leading-relaxed marker:text-highland-deep sm:text-[17px]">
            {trip.highlights.map((h) => (
              <li key={h} className="pl-1">
                {h}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* DAY BY DAY */}
      {trip.itinerary.length > 0 && (
        <section id="itinerary" className="bg-[#ECEAE3]">
          <div className="wrap pb-16 pt-14 lg:pb-28 lg:pt-25">
            <h2 className="h-sub mb-9">{L.trip.itinerary}</h2>
            <DayAccordion days={trip.itinerary} labels={L.trip} />

            {L.trip.note && (
              <div className="mt-16 flex flex-wrap items-center justify-between gap-8 bg-highland p-8 text-[#0E1F2E] sm:p-[clamp(40px,5vw,64px)]">
                <p className="max-w-[760px] text-xl font-semibold leading-tight tracking-[-0.015em] sm:text-[clamp(21px,1.8vw,26px)]">
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

      {/* INCLUDED / EXCLUDED — stacked */}
      {(trip.inclusions.length > 0 || trip.exclusions.length > 0) && (
        <section className="wrap flex max-w-[1440px] flex-col gap-12 py-16 lg:py-24">
          {trip.inclusions.length > 0 && (
            <div>
              <h2 className="h-sub">{L.trip.included}</h2>
              <ul className="mt-6 flex max-w-[860px] flex-col">
                {trip.inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-4 py-2.5 text-base sm:text-[17px]">
                    <CheckIcon size={20} className="mt-1 flex-none text-highland-deep" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {trip.exclusions.length > 0 && (
            <div>
              <h2 className="h-sub">{L.trip.excluded}</h2>
              <ul className="mt-6 flex max-w-[860px] flex-col">
                {trip.exclusions.map((item) => (
                  <li key={item} className="flex items-start gap-4 py-2.5 text-base sm:text-[17px]">
                    <CloseIcon size={20} className="mt-1 flex-none text-ink-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* GOOD TO KNOW + FAQ — stacked accordions, styled like the itinerary */}
      {(trip.additionalInfo.length > 0 || trip.faq.flatMap((g) => g.items ?? []).length > 0) && (
        <section className="bg-[#ECEAE3]">
          <div className="wrap flex flex-col gap-16 py-16 lg:py-24">
            {trip.additionalInfo.length > 0 && (
              <div>
                <h2 className="h-sub mb-9">{L.trip.goodToKnow}</h2>
                <div className="border-t border-line">
                  {trip.additionalInfo.map((info) => (
                    <AccordionRow key={info.title} title={info.title} html={richContent(info.description)} />
                  ))}
                </div>
              </div>
            )}
            {trip.faq.flatMap((g) => g.items ?? []).length > 0 && (
              <div>
                <h2 className="h-sub mb-9">{trip.faq.find((g) => g.title)?.title || "FAQ"}</h2>
                <div className="border-t border-line">
                  {trip.faq.flatMap((g) => g.items ?? []).map((f) => (
                    <AccordionRow key={f.q} title={f.q} html={richContent(f.a)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ENQUIRE */}
      <section id="enquire" className="scroll-mt-32 bg-night text-white">
        <div className="wrap flex flex-wrap items-start gap-x-24 gap-y-12 py-16 lg:py-25">
          <div className="min-w-0 flex-[1_1_440px]">
            {config.content.pageHeaders?.booking?.eyebrow && (
              <p className="meta mb-4 text-[12px] text-night-muted">{config.content.pageHeaders.booking.eyebrow}</p>
            )}
            <h2 className="display text-[26px] sm:text-[clamp(26px,2.3vw,34px)]">
              {config.content.pageHeaders?.booking?.title || L.trip.talkToExpert}
            </h2>
            {config.content.pageHeaders?.booking?.subtitle && (
              <p className="mt-5 max-w-[460px] text-base font-light text-[#DCE5EE] sm:text-[17px]">{config.content.pageHeaders.booking.subtitle}</p>
            )}
            {guide && (
              <div className="mt-9 flex items-center gap-4">
                <div className="relative flex size-16 flex-none items-center justify-center overflow-hidden rounded-full bg-night-raised text-night-muted">
                  {guide.image ? <Photo src={guide.image} alt="" sizes="64px" /> : <UserIcon size={26} />}
                </div>
                <div>
                  <div className="font-medium">{guide.name}</div>
                  {guide.designation && <div className="text-[14px] text-night-muted">{guide.designation}</div>}
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-[1_1_520px]">
            <EnquiryForm
              variant="trip"
              trips={[trip.title]}
              defaultTrip={trip.title}
              whatsapp={whatsapp}
              labels={L.trip}
              submitClassName="btn meta bg-highland px-8 py-5 text-[14px] tracking-[0.1em] text-[#0E1F2E] hover:bg-[#6fa5d4] disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="wrap py-16 lg:py-28">
          <h2 className="h-sub mb-10 lg:mb-12">{config.content.sections?.featured?.title || config.content.pageHeaders?.explore?.title || "Explore"}</h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((t) => (
              <TripCard key={t.id} trip={t} labels={L.card} size="md" />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

// Accordion row matching the day-by-day itinerary rows.
function AccordionRow({ title, html }: { title: string; html: string }) {
  return (
    <details className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center gap-4 py-5 transition-colors hover:bg-[#E4E1D8] sm:py-6 [&::-webkit-details-marker]:hidden">
        <span className="flex-1 text-base font-light uppercase leading-tight sm:text-[clamp(17px,1.5vw,22px)]">{title}</span>
        <span className="flex size-11 flex-none items-center justify-center transition-transform group-open:rotate-180">
          <ChevronDown size={26} strokeWidth={1.6} />
        </span>
      </summary>
      <div className="rich max-w-[860px] pb-8 pt-1" dangerouslySetInnerHTML={{ __html: html }} />
    </details>
  );
}
