import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type {
  BlogSummary,
  Category,
  FeaturedGroup,
  HomeSection,
  SiteConfig,
  TeamMember,
  Testimonial,
  TripDetail,
  TripSummary,
} from "@/lib/site";
import { getTrip, tripsForSpec } from "@/lib/site";
import type { Labels } from "@/lib/labels";
import { plainContent, richContent } from "@/lib/rich-content";
import Photo from "@/components/site/photo";
import TripCard, { PriceFrom, tripMeta } from "@/components/site/trip-card";
import HeroSlider from "@/components/home/hero-slider";
import BlogCard from "@/components/site/blog-card";
import TestimonialQuote from "@/components/home/testimonial-quote";
import { RailControls, RailTrack, ScrollRail } from "@/components/home/scroll-rail";
import NewsletterForm from "@/components/site/newsletter-form";
import { ArrowRightIcon, CheckIcon, StarIcon, UserIcon } from "lucide-react";

export type Destination = { key: string; name: string; image?: string; href: string };

export type HomeCtx = {
  config: SiteConfig;
  labels: Labels;
  trips: TripSummary[];
  total: number;
  groups: FeaturedGroup[];
  categories: Category[];
  destinations: Destination[];
  testimonials: Testimonial[];
  testimonialTotal: number;
  guide?: TeamMember;
  blogs: BlogSummary[];
  homeSections: HomeSection[];
  feature: TripDetail | null;
  whatsapp: string;
  // Rotates through API images for editorial slots with no dedicated field.
  pick: (i: number) => string | undefined;
};

type SectionCopy = { eyebrow?: string; title?: string; description?: string };

function Heading({ copy, fallback, aside, light }: { copy?: SectionCopy; fallback: ReactNode; aside?: ReactNode; light?: boolean }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 lg:mb-13">
      <div className="max-w-[760px]">
        {copy?.eyebrow && <p className={`meta mb-4 text-[12px] ${light ? "text-night-muted" : "text-ink-muted"}`}>{copy.eyebrow}</p>}
        <h2 className="h-section">{copy?.title || fallback}</h2>
        {copy?.description && (
          <p className={`mt-5 text-base font-light ${light ? "text-night-muted" : "text-ink-soft"}`}>{plainContent(copy.description)}</p>
        )}
      </div>
      {aside}
    </div>
  );
}

/* ---------- Hero ---------- */

// Featured trips shown in the fullscreen hero slider.
const HERO_SLIDE_LIMIT = 4;

export async function Hero({ ctx }: { ctx: HomeCtx }) {
  const { config, labels } = ctx;
  const c = config.content;
  // The design is a full-bleed photo hero, so the dashboard's fullscreen-overlay
  // copy wins, then the other hero variants' fields.
  const variant: { eyebrow?: string; badge?: string; headline?: string; sub?: string } =
    c.hero?.fullscreenOverlay ?? c.hero?.textHero ?? c.hero?.splitEditorial ?? c.hero?.searchHero ?? {};
  const image = c.home?.hero?.image || config.image || ctx.pick(0);
  // Homepage → Hero (home.hero): the short badge is the heading and the
  // headline sentence is the description under it. Older tenants without it
  // fall back to the hero-variant copy (eyebrow / headline / sub).
  const homeHero = c.home?.hero;
  const hasHomeHero = Boolean(homeHero?.badge || homeHero?.headline);
  const eyebrow = hasHomeHero ? undefined : variant.eyebrow || variant.badge;
  const headline = (hasHomeHero ? homeHero?.badge || homeHero?.headline : variant.headline) || config.name;
  const sub = hasHomeHero ? (homeHero?.badge ? homeHero.headline : undefined) : variant.sub || config.description;

  // Featured trips drive the fullscreen hero: dashboard featured spec first,
  // then trips flagged featured, then whatever exists.
  const spec = tripsForSpec(c.sections?.featured, ctx.trips, ctx.groups) ?? [];
  const featured = spec.length ? spec : ctx.trips.filter((t) => t.isFeatured);
  const list = (featured.length ? featured : ctx.trips).slice(0, HERO_SLIDE_LIMIT);
  const details = await Promise.all(list.map((t) => getTrip(t.slug)));
  const slides = list.map((t, k) => {
    const overview = details[k]?.overview ? plainContent(details[k].overview) : "";
    return {
      slug: t.slug,
      title: t.title,
      image: t.images[0] || ctx.pick(k),
      description: overview ? overview.slice(0, 300) + (overview.length > 300 ? "…" : "") : tripMeta(t) || undefined,
    };
  });

  if (slides.length) {
    return (
      <HeroSlider
        slides={slides}
        eyebrow={homeHero?.badge || eyebrow}
        viewLabel={labels.card.viewItinerary}
        bookLabel={labels.trip.bookNow}
      />
    );
  }

  return (
    <section className="relative flex min-h-[640px] flex-col overflow-hidden text-white lg:min-h-[min(860px,calc(100vh-88px))]">
      <Photo src={image} alt="" sizes="100vw" priority position="50% 40%" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,.45)_0%,rgba(14,12,10,.15)_30%,rgba(14,12,10,.2)_60%,rgba(14,12,10,.75)_100%)]" />
      <div className="wrap relative flex flex-1 flex-col items-center justify-end pb-10 pt-24 text-center md:justify-center md:pb-24">
        {eyebrow && <p className="meta mb-5 text-[12px] text-white/85">{eyebrow}</p>}
        <h1 className="display max-w-4xl text-[30px] leading-[1.1] sm:text-[clamp(34px,3.9vw,58px)]">{headline}</h1>
        {sub && <p className="mx-auto mt-5 max-w-[620px] text-base font-light text-white/90 sm:mt-7 sm:text-lg">{sub}</p>}
      </div>
    </section>
  );
}

/* ---------- About (content.home.about) ---------- */

// The design's intro block, from the dashboard's Homepage → About: eyebrow,
// headline, copy, points, CTA and image. Hidden until it has a title or copy.
// Rendered in the "whyUs" slot of the dashboard's section order.
export function WhyUs({ ctx }: { ctx: HomeCtx }) {
  const about = ctx.config.content.home?.about;
  if (!about?.title && !about?.copy) return null;
  const points = about.points?.filter(Boolean) ?? [];

  return (
    <section className="wrap flex flex-wrap items-start gap-x-24 gap-y-12 py-16 lg:py-28">
      <div className="min-w-0 flex-[1_1_540px]">
        {about.eyebrow && <p className="meta mb-4 text-[12px] text-ink-muted">{about.eyebrow}</p>}
        {about.title && <h2 className="display text-[26px] sm:text-[clamp(24px,2.1vw,32px)]">{about.title}</h2>}
        {about.copy && (
          <div className="rich mt-6 max-w-[580px] font-light text-ink-soft" dangerouslySetInnerHTML={{ __html: richContent(about.copy) }} />
        )}

        {points.length > 0 && (
          <ul className="mt-8 flex max-w-[580px] flex-col">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 py-2 text-[15px]">
                <CheckIcon strokeWidth={2} size={20} className="mt-0.5 flex-none text-highland-deep" />
                {p}
              </li>
            ))}
          </ul>
        )}

        {about.ctaLabel && (
          <Link href={about.ctaUrl || "/explore"} className="btn-dark mt-9">
            {about.ctaLabel}
          </Link>
        )}
      </div>

      {/* Only the dashboard's About image; no photo when none is set. */}
      {about.image && (
        <div className="min-w-0 flex-[1_1_420px] lg:sticky lg:top-[120px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] lg:max-h-[680px]">
            <Photo src={about.image} alt={about.title ?? ""} sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- Featured tags ---------- */

// How many featured tags get their own homepage section.
export const FEATURED_TAG_SECTIONS = 3;

// One section per featured tag (first three that have trips), alternating
// paper / stone backgrounds. Title and description come from the tag itself.
// `afterFirst` is slotted in after the first featured block (the homepage puts
// the category tiles there); it still renders when there are no featured trips.
export function Featured({ ctx, afterFirst }: { ctx: HomeCtx; afterFirst?: ReactNode }) {
  const bySlug = new Map(ctx.trips.map((t) => [t.slug, t]));
  const sections = ctx.groups
    // Tags switched off for the homepage in the dashboard stay out.
    .filter((g) => g.showOnHomepage !== false)
    .map((g) => ({ ...g, trips: g.tripSlugs.map((s) => bySlug.get(s)).filter((t): t is TripSummary => Boolean(t)) }))
    .filter((g) => g.trips.length)
    .slice(0, FEATURED_TAG_SECTIONS);
  if (!sections.length) return afterFirst ?? null;

  return (
    <>
      {sections.map((g, i) => (
        <Fragment key={g.slug}>
          {/* Alternate backgrounds, counting the stone category tiles as one band. */}
          <section id={`featured-${g.slug}`} className={`py-16 lg:py-24 ${(i + (afterFirst && i > 0 ? 1 : 0)) % 2 ? "bg-stone" : ""}`}>
            <ScrollRail>
              <div className="wrap mb-10 flex flex-wrap items-end justify-between gap-6 lg:mb-12">
                <div className="max-w-[760px]">
                  <h2 className="h-section">{g.label}</h2>
                  {g.description && <p className="standfirst mt-4">{plainContent(g.description)}</p>}
                </div>
                <RailControls />
              </div>
              <RailTrack label={g.label}>
                {g.trips.map((t) => (
                  <div key={t.id} className="flex w-[82vw] flex-none snap-start sm:w-[340px] xl:w-[360px]">
                    <TripCard trip={t} labels={ctx.labels.card} />
                  </div>
                ))}
              </RailTrack>
            </ScrollRail>
          </section>
          {i === 0 && afterFirst}
        </Fragment>
      ))}
    </>
  );
}

/* ---------- Trip rail (featuredRail, customTrips-*, /homepage/sections) ---------- */

export function TripRail({
  ctx,
  copy,
  trips,
  cta,
  tone = "stone",
}: {
  ctx: HomeCtx;
  copy: SectionCopy;
  trips: TripSummary[];
  cta?: string;
  tone?: "stone" | "paper";
}) {
  if (!trips.length) return null;
  return (
    <section className={tone === "stone" ? "bg-stone" : ""}>
      <div className="py-16 lg:py-30">
        <div className="wrap">
          <Heading
            copy={copy}
            fallback=""
            aside={
              <Link href="/explore" className="inline-flex items-center gap-2 font-medium underline-offset-[6px] hover:underline">
                {cta || "Explore all"} <ArrowRightIcon size={16} strokeWidth={1.8} />
              </Link>
            }
          />
        </div>
        <div className="wrap flex gap-8 overflow-x-auto pb-2 scrollbar-hide lg:gap-14">
          {trips.map((t) => (
            <div key={t.id} className="flex w-[82vw] flex-none sm:w-[380px]">
              <TripCard trip={t} labels={ctx.labels.card} size="md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedRail({ ctx }: { ctx: HomeCtx }) {
  const copy = ctx.config.content.sections?.featuredRail;
  const trips = tripsForSpec(copy, ctx.trips, ctx.groups);
  if (!trips?.length) return null;
  const group = ctx.groups.find((g) => copy?.tags?.split(",").map((t) => t.trim()).includes(g.slug));
  const shownAsSection = ctx.groups.slice(0, FEATURED_TAG_SECTIONS).some((g) => g.slug === group?.slug);
  if (shownAsSection && !copy?.tripSlugs) return null;
  return <TripRail ctx={ctx} copy={{ ...copy, title: copy?.title || group?.label }} trips={trips} cta={copy?.exploreAll} />;
}

/* ---------- Categories ---------- */

export function CategoryTiles({ ctx }: { ctx: HomeCtx }) {
  const copy = ctx.config.content.sections?.categories;
  if (!ctx.categories.length) return null;
  return (
    <section id="styles" className="bg-stone">
      <div className="py-16 lg:py-30">
        <ScrollRail>
          <div className="wrap">
            <Heading copy={copy} fallback={<>Find <em>your</em> journey</>} aside={<RailControls />} />
          </div>
          <RailTrack label={copy?.title || "Trip styles"}>
            {ctx.categories.map((c) => (
              <Link
                key={c.id}
                href={`/explore?category=${encodeURIComponent(c.categoryHandle)}`}
                className="ht-tile relative flex aspect-[4/5] w-[78vw] flex-none snap-start flex-col justify-end overflow-hidden rounded-[4px] text-white sm:w-[340px] xl:w-[360px]"
              >
                <Photo src={c.categoryImage} alt="" sizes="(min-width: 640px) 360px, 78vw" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0)_45%,rgba(14,12,10,.78)_100%)]" />
                <div className="relative p-5 sm:p-7">
                  <div className="display text-xl">{c.categoryName}</div>
                </div>
              </Link>
            ))}
          </RailTrack>
        </ScrollRail>
      </div>
    </section>
  );
}

/* ---------- Destinations (cities) ---------- */

export function Destinations({ ctx, copy }: { ctx: HomeCtx; copy?: SectionCopy }) {
  if (!ctx.destinations.length) return null;
  return (
    <section className="py-16 lg:py-32">
      <ScrollRail>
        <div className="wrap">
          <Heading copy={copy} fallback={<>Where we <em>go</em></>} aside={<RailControls />} />
        </div>
        <RailTrack label={copy?.title || "Destinations"}>
          {ctx.destinations.map((d) => (
            <Link key={d.key} href={d.href} className="ht-card w-[78vw] flex-none snap-start sm:w-[300px] xl:w-[320px]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Photo src={d.image} alt={d.name} sizes="(min-width: 640px) 320px, 78vw" />
              </div>
              <h3 className="display mt-5 text-base">{d.name}</h3>
            </Link>
          ))}
        </RailTrack>
      </ScrollRail>
    </section>
  );
}

/* ---------- Stats ---------- */

export function Stats({ ctx }: { ctx: HomeCtx }) {
  // Only numbers entered in the dashboard (sections.stats.*Value); nothing is
  // computed from trip or destination counts.
  const s = ctx.config.content.sections?.stats ?? {};
  const items = [
    { value: s.yearsValue, label: s.years },
    { value: s.destinationsValue, label: s.destinations },
    { value: s.tripsValue, label: s.trips },
    { value: s.travelersValue, label: s.travelers },
  ].filter((i): i is { value: string; label: string | undefined } => Boolean(i.value?.trim()));
  if (!items.length) return null;
  return (
    <section className="bg-night text-paper">
      <dl className="wrap grid grid-cols-2 gap-x-6 gap-y-10 py-16 lg:grid-cols-4 lg:py-24">
        {items.map((i) => (
          <div key={`${i.label}-${i.value}`} className="border-t border-paper/25 pt-5">
            <dd className="text-[39px] font-semibold leading-none tracking-[-0.03em] sm:text-[56px]">{i.value}</dd>
            {i.label && <dt className="mt-3 text-[14px] text-night-muted">{i.label}</dt>}
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---------- Trip of the month ---------- */

export function TripOfMonth({ ctx }: { ctx: HomeCtx }) {
  const f = ctx.feature;
  const copy = ctx.config.content.sections?.tripOfMonth;
  if (!f) return null;
  return (
    <section className="relative lg:pt-16">
      <div className="relative h-[360px] overflow-hidden sm:h-[560px] lg:h-[820px]">
        <Photo src={f.images[1] ?? f.images[0]} alt={f.title} sizes="100vw" />
      </div>
      <div className="wrap relative -mt-24 flex justify-end pb-16 lg:-mt-[300px] lg:pb-0">
        <Link
          href={`/trip/${f.slug}`}
          className="ht-card block w-full max-w-[640px] rounded-[4px] bg-paper p-6 text-ink shadow-[0_30px_60px_-30px_rgba(26,23,20,.35)] sm:p-[clamp(32px,4vw,60px)]"
        >
          <div className="meta text-[12px] sm:text-sm">{[copy?.eyebrow, f.duration].filter(Boolean).join(" · ")}</div>
          <h2 className="display mt-4 text-xl sm:mt-5 sm:text-[clamp(22px,1.9vw,28px)]">{copy?.title || f.title}</h2>
          {copy?.subtitle && <p className="mt-2 text-base font-light">{copy.subtitle}</p>}
          {(copy?.description || f.overview) && (
            <p className="standfirst mt-5 line-clamp-4 sm:mt-6">{plainContent(copy?.description || f.overview)}</p>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-6 sm:mt-8">
            <span className="btn-mono">{copy?.viewItinerary || ctx.labels.card.viewItinerary}</span>
            <PriceFrom price={f.price} labels={ctx.labels.card} />
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */

// Five stars, filled up to the rounded rating, outlined after.
function Stars({ rating, size = 18, className }: { rating: number; size?: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span className={`inline-flex gap-0.5 ${className ?? ""}`} role="img" aria-label={`${rating.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} size={size} strokeWidth={1.5} fill={i < filled ? "currentColor" : "none"} className={i < filled ? "" : "opacity-40"} />
      ))}
    </span>
  );
}

// "Pim V., Netherlands" → name + origin line; authors without a comma keep one line.
function splitAuthor(author: string) {
  const at = author.indexOf(",");
  return at === -1 ? { name: author.trim() } : { name: author.slice(0, at).trim(), origin: author.slice(at + 1).trim() || undefined };
}

function GuestCard({ t, featured }: { t: Testimonial; featured?: boolean }) {
  const { name, origin } = splitAuthor(t.author);
  return (
    <figure
      className={`m-0 flex h-full flex-col gap-6 rounded-[4px] p-7 sm:p-9 ${
        featured ? "bg-night text-paper lg:gap-8 lg:p-12" : "bg-stone"
      }`}
    >
      <Stars rating={t.rating} size={featured ? 20 : 16} className={featured ? "text-highland" : "text-highland-deep"} />
      <TestimonialQuote
        text={plainContent(t.content)}
        lines={featured ? 9 : 5}
        className={featured ? "text-xl font-light leading-[1.4] sm:text-[26px]" : "text-[17px] font-light leading-[1.45]"}
      />
      <figcaption className={`mt-auto flex items-center gap-4 border-t pt-5 ${featured ? "border-white/15" : "border-line"}`}>
        <span className={`relative flex size-12 flex-none items-center justify-center overflow-hidden rounded-full ${featured ? "bg-night-raised" : "bg-paper"}`}>
          {t.media ? <Photo src={t.media} alt="" sizes="48px" /> : <UserIcon size={20} strokeWidth={1.8} className="opacity-60" />}
        </span>
        <span className="min-w-0">
          <span className="block font-medium">{name}</span>
          {origin && <span className={`block text-[14px] ${featured ? "text-night-muted" : "text-ink-muted"}`}>{origin}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ ctx }: { ctx: HomeCtx }) {
  const copy = ctx.config.content.sections?.testimonials;
  const list = ctx.testimonials;
  if (!list.length) return null;
  // Summary from the guest book itself: the API's total and the average of
  // the ratings we have (every published one up to the fetch limit).
  const average = list.reduce((sum, t) => sum + (Number(t.rating) || 0), 0) / list.length;
  const total = Math.max(ctx.testimonialTotal, list.length);
  const [first, ...rest] = list;
  const side = rest.slice(0, 2);
  // Homepage shows at most 9: the featured one, two beside it, six in the rail.
  const more = rest.slice(2, 2 + TESTIMONIAL_RAIL);
  const platforms = reviewPlatforms(ctx.config);

  return (
    <section className="py-16 lg:py-32">
      <div className="wrap">
        <Heading
          copy={copy}
          fallback={<>From our <em>guest book</em></>}
          aside={
            <div className="flex items-center gap-4 sm:text-right">
              <div className="text-[44px] font-semibold leading-none tracking-[-0.02em]">{average.toFixed(1)}</div>
              <div>
                <Stars rating={average} className="text-highland-deep" />
                <div className="mt-1 text-sm text-ink-muted">
                  {total} {total === 1 ? "guest review" : "guest reviews"}
                </div>
              </div>
            </div>
          }
        />

        <div className={`grid grid-cols-1 gap-6 ${side.length ? "lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]" : ""}`}>
          <GuestCard t={first} featured />
          {side.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
              {side.map((t) => (
                <GuestCard key={t.id} t={t} />
              ))}
            </div>
          )}
        </div>

      </div>

      {more.length > 0 && (
        <ScrollRail>
          <div className="wrap mt-6 flex justify-end">
            <RailControls />
          </div>
          <div className="mt-4">
            <RailTrack label="More guest reviews">
              {more.map((t) => (
                <div key={t.id} className="w-[82vw] flex-none snap-start sm:w-[380px]">
                  <GuestCard t={t} />
                </div>
              ))}
            </RailTrack>
          </div>
        </ScrollRail>
      )}

      {platforms.length > 0 && (
        <div className="wrap mt-12">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-8">
            <span className="meta text-[12px] text-ink-muted">Read more reviews on</span>
            <ul className="flex flex-wrap gap-3">
              {platforms.map((p) => (
                <li key={p.name}>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 border border-line px-5 py-3 transition-colors hover:border-ink"
                  >
                    <span className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG */}
                      <img src={p.logo} alt="" width={22} height={22} className="size-[22px]" />
                      <span className="font-semibold">{p.name}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold">{p.rating.toFixed(1)}</span>
                      <Stars rating={p.rating} size={14} className="text-highland-deep" />
                    </span>
                    <span className="text-[14px] text-ink-muted">{p.count} reviews</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

const TESTIMONIAL_RAIL = 6;

// Google / Tripadvisor profiles from site config, when they have a real link
// and at least one review.
function reviewPlatforms(config: SiteConfig) {
  const r = config.reviews;
  return [
    { name: "Google", logo: "/logos/google.svg", ...r?.googleReview },
    { name: "Tripadvisor", logo: "/logos/tripadvisor.svg", ...r?.tripadvisor },
  ].filter((p): p is { name: string; logo: string; link: string; count: number; rating: number } =>
    typeof p.link === "string" && /^https?:\/\/[^\s]+$/.test(p.link) && Number(p.count) > 0 && Number.isFinite(Number(p.rating)),
  );
}

/* ---------- Journal ---------- */

export function Journal({ ctx }: { ctx: HomeCtx }) {
  const copy = ctx.config.content.sections?.blog;
  if (!ctx.blogs.length) return null;
  return (
    <section id="journal" className="bg-stone">
      <div className="py-16 lg:py-32">
        <ScrollRail>
          <div className="wrap">
            <Heading
              copy={copy}
              fallback={<>The trail <em>journal</em></>}
              aside={
                <div className="flex items-center gap-6">
                  <Link href="/blog" className="inline-flex items-center gap-2 font-medium underline-offset-[6px] hover:underline">
                    {copy?.allArticles || "All stories"} <ArrowRightIcon size={16} strokeWidth={1.8} />
                  </Link>
                  <RailControls />
                </div>
              }
            />
          </div>
          <RailTrack label={copy?.title || "Journal"}>
            {ctx.blogs.map((b) => (
              <div key={b.id} className="w-[82vw] flex-none snap-start sm:w-[340px] xl:w-[360px]">
                <BlogCard blog={b} />
              </div>
            ))}
          </RailTrack>
        </ScrollRail>
      </div>
    </section>
  );
}

/* ---------- Newsletter ---------- */

export function Newsletter({ ctx }: { ctx: HomeCtx }) {
  const n = ctx.labels.newsletter;
  const copy = ctx.config.content.sections?.newsletter;
  return (
    <section className="bg-night text-paper">
      <div className="wrap flex flex-wrap items-end justify-between gap-10 py-16 lg:py-24">
        <div className="max-w-[640px]">
          {copy?.eyebrow && <p className="meta mb-4 text-[12px] text-night-muted">{copy.eyebrow}</p>}
          {n.title && <h2 className="h-section">{n.title}</h2>}
          {n.description && <p className="mt-5 text-base font-light text-night-muted">{n.description}</p>}
        </div>
        <NewsletterForm labels={n} />
      </div>
    </section>
  );
}

/* ---------- Information (content.home.information) ---------- */

// Dark two-column feature from the dashboard's Homepage → Information:
// image, eyebrow, title, rich copy and CTA. Hidden until it has a title or copy.
export function Information({ ctx }: { ctx: HomeCtx }) {
  const info = ctx.config.content.home?.information;
  if (!info?.title && !info?.copy) return null;
  return (
    <section id="information" className="bg-night text-paper">
      <div className="wrap flex flex-wrap items-center gap-x-24 gap-y-12 py-16 lg:py-28">
        {info.image && (
          <div className="relative aspect-[4/5] min-w-0 flex-[1_1_420px] overflow-hidden rounded-[4px] bg-night-raised lg:max-h-[680px]">
            <Photo src={info.image} alt={info.title ?? ""} sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
        )}
        <div className="min-w-0 flex-[1_1_520px]">
          {info.eyebrow && <p className="meta mb-4 text-[12px] text-night-muted">{info.eyebrow}</p>}
          {info.title && <h2 className="display text-[26px] sm:text-[clamp(22px,1.7vw,26px)]">{info.title}</h2>}
          {info.copy && (
            <div
              className="rich mt-6 max-w-[620px] font-light text-[#DCE5EE] [&_a]:text-highland-tint [&_h2]:text-paper [&_h3]:text-paper"
              dangerouslySetInnerHTML={{ __html: richContent(info.copy) }}
            />
          )}
          {info.ctaLabel && (
            <Link href={info.ctaUrl || "/contact"} className="btn-outline-light mt-9">
              {info.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Dashboard custom sections ---------- */

export function CustomSection({ ctx, id }: { ctx: HomeCtx; id: string }) {
  const spec = (ctx.config.content.sections ?? {})[id] as (SectionCopy & { tripSlugs?: string; tags?: string; viewAll?: string }) | undefined;
  const fromSpec = spec ? tripsForSpec(spec, ctx.trips, ctx.groups) : null;
  if (spec && fromSpec?.length) return <TripRail ctx={ctx} copy={spec} trips={fromSpec} cta={spec.viewAll} tone="paper" />;
  const hs = ctx.homeSections.find((s) => s.id === id || `${s.type}-${s.id}` === id);
  if (hs?.trips.length) return <TripRail ctx={ctx} copy={{ title: hs.title, description: hs.description ?? undefined }} trips={hs.trips} tone="paper" />;
  return null;
}
