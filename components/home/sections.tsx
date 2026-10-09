import Link from "next/link";
import type { ReactNode } from "react";
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
import EnquiryForm from "@/components/site/enquiry-form";
import NewsletterForm from "@/components/site/newsletter-form";
import { CheckIcon } from "@/components/site/icons";

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
          <ul className="mt-8 flex max-w-[580px] flex-col border-b border-line">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 border-t border-line py-3.5 text-[15px]">
                <CheckIcon size={20} className="mt-0.5 flex-none text-highland-deep" />
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
export function Featured({ ctx }: { ctx: HomeCtx }) {
  const bySlug = new Map(ctx.trips.map((t) => [t.slug, t]));
  const sections = ctx.groups
    .map((g) => ({ ...g, trips: g.tripSlugs.map((s) => bySlug.get(s)).filter((t): t is TripSummary => Boolean(t)) }))
    .filter((g) => g.trips.length)
    .slice(0, FEATURED_TAG_SECTIONS);
  if (!sections.length) return null;

  return (
    <>
      {sections.map((g, i) => (
        <section key={g.slug} id={`featured-${g.slug}`} className={i % 2 ? "bg-stone" : ""}>
          <div className="wrap py-16 lg:py-24">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6 lg:mb-12">
              <div className="max-w-[760px]">
                <h2 className="h-section">{g.label}</h2>
                {g.description && <p className="standfirst mt-4">{plainContent(g.description)}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.trips.map((t) => (
                <div key={t.id} className="flex">
                  <TripCard trip={t} labels={ctx.labels.card} />
                </div>
              ))}
            </div>
          </div>
        </section>
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
              <Link href="/explore" className="font-medium underline-offset-[6px] hover:underline">
                {cta || "Explore all"} →
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
        <div className="wrap">
          <Heading copy={copy} fallback={<>Find <em>your</em> journey</>} />
        </div>
        <div className="wrap grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ctx.categories.map((c) => (
            <Link
              key={c.id}
              href={`/explore?category=${encodeURIComponent(c.categoryHandle)}`}
              className="ht-tile relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[4px] text-white"
            >
              <Photo src={c.categoryImage} alt="" sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0)_45%,rgba(14,12,10,.78)_100%)]" />
              <div className="relative p-5 sm:p-7">
                <div className="display text-xl">{c.categoryName}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Destinations (cities) ---------- */

export function Destinations({ ctx, copy }: { ctx: HomeCtx; copy?: SectionCopy }) {
  if (!ctx.destinations.length) return null;
  return (
    <section className="wrap py-16 lg:py-32">
      <Heading copy={copy} fallback={<>Where we <em>go</em></>} />
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ctx.destinations.slice(0, 6).map((d) => (
          <Link key={d.key} href={d.href} className="ht-card">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Photo src={d.image} alt={d.name} sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" />
            </div>
            <h3 className="display mt-5 text-base">{d.name}</h3>
          </Link>
        ))}
      </div>
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

export function Testimonials({ ctx }: { ctx: HomeCtx }) {
  const copy = ctx.config.content.sections?.testimonials;
  const r = ctx.config.reviews;
  const rating = r?.googleReview?.count ? r.googleReview : r?.tripadvisor?.count ? r.tripadvisor : null;
  if (!ctx.testimonials.length) return null;
  return (
    <section className="wrap py-16 lg:py-32">
      <Heading
        copy={copy}
        fallback={<>From our <em>guest book</em></>}
        aside={
          rating ? (
            <a href={rating.link} target="_blank" rel="noopener noreferrer" className="text-right">
              <div className="text-[35px] font-semibold leading-none">
                {rating.rating.toFixed(1)} <span className="text-xl text-highland">★★★★★</span>
              </div>
              <div className="mt-1.5 text-sm text-ink-muted">{rating.count} reviews</div>
            </a>
          ) : undefined
        }
      />
      <div className="grid grid-cols-1 gap-7 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        {ctx.testimonials.slice(0, 3).map((t) => (
          <figure key={t.id} className="m-0 flex flex-col gap-7 rounded-[4px] bg-stone p-7 sm:p-9">
            <div className="text-lg text-highland-deep" aria-label={`${t.rating} out of 5`}>
              {"★".repeat(Math.round(t.rating))}
            </div>
            <blockquote className="m-0 text-lg font-light leading-[1.35] sm:text-[20px]">“{plainContent(t.content)}”</blockquote>
            <figcaption className="mt-auto flex items-center gap-4 border-t border-line pt-5 font-medium">
              {t.media && (
                <span className="relative size-11 flex-none overflow-hidden rounded-full">
                  <Photo src={t.media} alt="" sizes="44px" />
                </span>
              )}
              {t.author}
            </figcaption>
          </figure>
        ))}
      </div>
      {ctx.config.associations?.items?.length ? (
        <div className="mt-18 flex flex-wrap items-center justify-between gap-x-12 gap-y-6 border-t border-line pt-7 text-ink-muted">
          {ctx.config.associations.title && <span className="text-[14px]">{ctx.config.associations.title}</span>}
          <div className="flex flex-wrap items-center gap-10">
            {ctx.config.associations.items.map((a) => (
              <span key={a.title} className="relative h-12 w-24" title={a.title}>
                <Photo src={a.image} alt={a.title} sizes="96px" className="!object-contain" />
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* ---------- Journal ---------- */

export function Journal({ ctx }: { ctx: HomeCtx }) {
  const copy = ctx.config.content.sections?.blog;
  if (!ctx.blogs.length) return null;
  return (
    <section id="journal" className="bg-stone">
      <div className="wrap py-16 lg:py-32">
        <Heading
          copy={copy}
          fallback={<>The trail <em>journal</em></>}
          aside={
            <Link href="/blog" className="font-medium underline-offset-[6px] hover:underline">
              {copy?.allArticles || "All stories"} →
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ctx.blogs.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
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

/* ---------- Plan / enquiry (pageHeaders.booking) ---------- */

export function Plan({ ctx }: { ctx: HomeCtx }) {
  const h = ctx.config.content.pageHeaders?.booking;
  return (
    <section id="plan" className="bg-night text-paper">
      <div className="mx-auto flex max-w-[1440px] flex-wrap">
        <div className="relative min-h-[320px] min-w-0 flex-[1_1_480px] lg:order-2 lg:min-h-[760px]">
          <Photo src={h?.image || ctx.pick(6)} alt="" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
        <div className="min-w-0 flex-[1_1_520px] px-4 py-14 sm:px-[clamp(20px,5vw,96px)] sm:py-[clamp(48px,6vw,112px)]">
          {h?.eyebrow && <p className="meta mb-4 text-[12px] text-night-muted">{h.eyebrow}</p>}
          <h2 className="display text-[27px] sm:text-[clamp(22px,2.3vw,35px)]">{h?.title || <>Tell us where you’d like to <em>go.</em></>}</h2>
          {h?.subtitle && <p className="mt-5 max-w-[460px] text-base font-light text-night-muted">{h.subtitle}</p>}
          <div className="mt-10">
            <EnquiryForm trips={ctx.trips.map((t) => t.title)} whatsapp={ctx.whatsapp} labels={ctx.labels.trip} />
          </div>
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
