import { cache } from "react";
import { apiFetch } from "@/lib/api";
import { htmlListItems } from "@/lib/media";
import type { SiteContent } from "@/lib/site-content";

export type { SiteContent, PageHeaderFields } from "@/lib/site-content";

// Typed reads of the TripEleven read-only API. Every brand detail (name, logo,
// contacts, copy) comes from the tenant's /site-config, so this codebase can be
// pointed at any tenant without code changes.

async function getJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await apiFetch(path, { next: { revalidate: 300 }, ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Raw API payloads are loosely typed; they are narrowed field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

// Several detail fields arrive as JSON-encoded strings.
function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/* ---------- Site config ---------- */

export type SiteConfig = {
  name: string;
  logo?: string;
  showName: boolean;
  description?: string;
  url?: string;
  image?: string;
  email?: string;
  whatsAppNumber?: string;
  phoneNumbers: { label: string; number: string }[];
  openHours?: string;
  experience?: string;
  established?: string;
  fullAddress?: string;
  socials: Record<string, string>;
  // Dashboard SEO settings; the site-wide fallbacks for <title>, description,
  // share image and favicon.
  seo: { title?: string; description?: string; image?: string; favicon?: string };
  reviews?: {
    googleReview?: { count: number; rating: number; link: string };
    tripadvisor?: { count: number; rating: number; link: string };
  };
  documents: { title: string; key: string; path: string; published: boolean }[];
  associations?: { title: string; items: { image: string; title: string }[] };
  integrations: {
    ga?: { enabled?: boolean; id?: string };
    gtm?: { enabled?: boolean; id?: string };
    metaPixel?: { enabled?: boolean; id?: string };
    clarity?: { enabled?: boolean; id?: string };
    tawk?: { enabled?: boolean; propertyId?: string; widgetId?: string };
    whatsapp?: { enabled?: boolean };
  };
  // Cookie banner; when on, analytics/marketing tags wait for the visitor's yes.
  consent: { enabled: boolean };
  content: SiteContent;
};

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  // no-store: dashboard edits (copy, images, section order) must show on the
  // next page load, as on the TripEleven storefront.
  const body = await getJson<{ data?: { config?: Record<string, unknown> } }>("/site-config", { cache: "no-store", next: undefined });
  const c = (body?.data?.config ?? {}) as Raw;
  return {
    name: c.name || "Highland Treasure",
    logo: c.logo || undefined,
    showName: c.showName !== false,
    description: c.description || undefined,
    url: c.url || process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || undefined,
    image: c.image || undefined,
    email: c.email || undefined,
    whatsAppNumber:
      c.integrations?.whatsapp?.enabled === false
        ? undefined
        : String(c.whatsAppNumber ?? "").replace(/\D/g, "") || undefined,
    phoneNumbers: (Array.isArray(c.phoneNumbers) ? c.phoneNumbers : []).flatMap(
      (entry: Record<string, string>) =>
        Object.entries(entry).map(([label, number]) => ({ label, number })),
    ),
    openHours: c.openHours || undefined,
    experience: c.experience || undefined,
    established: c.established || undefined,
    fullAddress: c.fullAddress || undefined,
    socials: c.socials ?? {},
    seo: {
      title: c.seo?.title?.trim() || undefined,
      description: c.seo?.description?.trim() || undefined,
      image: c.seo?.image || undefined,
      favicon: c.seo?.favicon || undefined,
    },
    reviews: c.reviews,
    documents: Array.isArray(c.documents) ? c.documents : [],
    associations: c.associations,
    integrations: c.integrations ?? {},
    consent: { enabled: c.consent?.enabled === true },
    content: c.content ?? {},
  };
});

/* ---------- Trips ---------- */

export type TripSummary = {
  id: number;
  title: string;
  slug: string;
  images: string[];
  price: number | null;
  maxPrice?: number | null;
  duration?: string | null;
  guestCapacity?: number | null;
  difficultyLevel?: string | null;
  isFeatured?: boolean;
  reviewCount?: number;
  maximumAltitude?: number | null;
};

export type ItineraryDay = {
  day: number;
  title: string;
  description?: string;
  duration?: string;
  distance?: string;
  ascent?: string;
  descent?: string;
  meals?: string[];
  accommodations?: string[];
  dayFeaturedImages?: { image: string; title?: string; description?: string }[];
};

export type TripDetail = TripSummary & {
  overview?: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  additionalInfo: { title: string; description: string }[];
  faq: { title?: string; items: { q: string; a: string }[] }[];
  meetingPoint?: string;
  dropOffPoint?: string;
  languages: string[];
  accommodations: string[];
  meals: string[];
  // Intro video URL (YouTube/Vimeo) from the dashboard; often empty.
  videoIntro?: string;
  // Route map image picked in the dashboard; often empty.
  routeMap?: string;
  countryId?: string | null;
  cityId?: string | null;
  tripCategoryId?: string | null;
  seo?: { metaTitle?: string; metaDescription?: string; featuredMedia?: string | null };
  // Optional add-ons offered on this trip, resolved via getExtras().
  extraIds: number[];
  featuredTags: { slug: string; name: string; description?: string; showOnHomepage?: boolean; order?: number }[];
};

export type TripQuery = {
  search?: string;
  category?: string;
  country?: string;
  city?: string;
  page?: number;
  limit?: number;
};

export const getTrips = cache(
  async (q: TripQuery = {}): Promise<{ trips: TripSummary[]; totalPages: number; total: number }> => {
    const qs = new URLSearchParams({ page: String(q.page ?? 1), limit: String(q.limit ?? 50) });
    for (const key of ["search", "category", "country", "city"] as const) {
      if (q[key]) qs.set(key, q[key]!);
    }
    const body = await getJson<{
      data?: TripSummary[];
      pagination?: { totalPages?: number; total?: number };
    }>(`/activity?${qs}`);
    const trips = (body?.data ?? []).map((t) => ({ ...t, images: parseJson<string[]>(t.images, []) }));
    return {
      trips,
      totalPages: body?.pagination?.totalPages ?? 1,
      total: body?.pagination?.total ?? trips.length,
    };
  },
);

export const getTrip = cache(async (slug: string): Promise<TripDetail | null> => {
  const body = await getJson<{ data?: Raw }>(
    `/activity/slug/${encodeURIComponent(slug)}`,
  );
  const t = body?.data;
  if (!t) return null;
  // The itinerary is a list of variants; use the default (or first) one.
  const variants = parseJson<{ isDefault?: boolean; days?: ItineraryDay[] }[]>(t.itinerary, []);
  const variant = variants.find((v) => v.isDefault) ?? variants[0];
  const htmlList = (v: unknown) => parseJson<string[]>(v, []).flatMap((html) => htmlListItems(html));
  return {
    ...(t as TripSummary),
    images: parseJson<string[]>(t.images, []),
    overview: t.overview || undefined,
    highlights: htmlList(t.highlights),
    inclusions: htmlList(t.inclusions),
    exclusions: htmlList(t.exclusions),
    itinerary: (variant?.days ?? []).sort((a, b) => a.day - b.day),
    additionalInfo: parseJson(t.additionalInfo, []),
    faq: parseJson(t.faq, []),
    meetingPoint: t.meetingPoint || undefined,
    dropOffPoint: t.dropOffPoint || undefined,
    languages: parseJson(t.languages, []),
    accommodations: parseJson<string[]>(t.accommodations, []).filter(Boolean),
    meals: parseJson<string[]>(t.meals, []).filter(Boolean),
    videoIntro: typeof t.videoIntro === "string" && t.videoIntro.trim() ? t.videoIntro.trim() : undefined,
    routeMap: typeof t.routeMap === "string" && t.routeMap.trim() ? t.routeMap.trim() : undefined,
    countryId: t.countryId,
    cityId: t.cityId,
    tripCategoryId: t.tripCategoryId,
    seo: parseJson(t.seo, undefined),
    extraIds: parseJson<unknown[]>(t.extraIds, []).map(Number).filter(Number.isFinite),
    featuredTags: parseJson<Raw[]>(t.featuredTags, [])
      .filter((g) => g?.slug && g?.name)
      .map((g) => ({
        slug: String(g.slug),
        name: String(g.name),
        description: g.description || undefined,
        showOnHomepage: g.showOnHomepage,
        order: typeof g.order === "number" ? g.order : undefined,
      })),
  };
});

/* ---------- Departures ---------- */

export type Departure = { id: number; startDate: string; endDate: string; price: number | null; availableSpots: number };

// A trip's upcoming fixed departures that still take bookings, soonest first.
// No departures is a normal state; an endpoint failure reads the same.
export const getDepartures = cache(async (activityId: number): Promise<Departure[]> => {
  const body = await getJson<{ data?: { departures?: Raw[] } }>(
    `/departure?activityId=${activityId}&bookable=true&page=1&limit=100`,
  );
  const now = Date.now();
  return (body?.data?.departures ?? [])
    .filter((d) => d.status === "OPEN" && Number(d.availableSpots) > 0 && new Date(d.startDate).getTime() > now)
    .map((d) => ({
      id: Number(d.id),
      startDate: String(d.startDate),
      endDate: String(d.endDate),
      price: d.price == null ? null : Number(d.price),
      availableSpots: Number(d.availableSpots),
    }))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
});

/* ---------- Extras (trip add-ons) ---------- */

export type Extra = { id: number; type?: string; name: string; description?: string; images: string[]; price: number | null };

// The tenant's whole add-on catalogue; trips reference entries by id.
export const getExtras = cache(async (): Promise<Extra[]> => {
  const body = await getJson<{ data?: { extras?: Raw[] } }>("/extras?page=1&limit=100");
  return (body?.data?.extras ?? []).map((e) => ({
    id: Number(e.id),
    type: e.type || undefined,
    name: e.name,
    description: e.description || undefined,
    images: parseJson<string[]>(e.images, []),
    price: e.price == null ? null : Number(e.price),
  }));
});

/* ---------- Taxonomy ---------- */

export type Category = { id: string; categoryHandle: string; categoryName: string; categoryImage?: string };
export type Country = { id: string; countryHandle: string; countryName: string; countryImage?: string };
export type City = { id: string; cityHandle: string; cityName: string; cityImage?: string };

export const getCategories = cache(async (): Promise<Category[]> => {
  const body = await getJson<{ data?: { tripCategories?: Category[] } }>("/trip-category?page=1&limit=100");
  return body?.data?.tripCategories ?? [];
});

export const getCountries = cache(async (): Promise<Country[]> => {
  const body = await getJson<{ data?: { countries?: Country[] } }>("/country?page=1&limit=100");
  return body?.data?.countries ?? [];
});

export const getCities = cache(async (): Promise<City[]> => {
  const body = await getJson<{ data?: { cities?: City[] } }>("/city?page=1&limit=100");
  return body?.data?.cities ?? [];
});

/* ---------- Navigation ---------- */

export type NavItem = { id: string; label: string; url: string; children: NavItem[] };

async function getNav(path: string): Promise<NavItem[]> {
  const body = await getJson<{ data?: { auto?: boolean; items?: NavItem[]; autoItems?: NavItem[] } }>(path);
  const d = body?.data;
  if (!d) return [];
  const items = d.items?.length ? d.items : (d.autoItems ?? []);
  const walk = (list: NavItem[]): NavItem[] =>
    list.map((i) => ({ ...i, url: i.url ?? "", children: walk(i.children ?? []) }));
  return walk(items);
}

export const getMenu = cache(() => getNav("/menu"));
export const getFooterNav = cache(() => getNav("/footer"));

// Featured tags (best-selling, best-of-2026, ...). The /featured index is the
// real source; while TripEleven keeps it dashboard-only for API keys it 401s,
// and we fall back to the auto-generated footer, which lists every featured tag
// that has trips (tags with no published trips are absent there).
export type FeaturedGroup = { slug: string; label: string; description?: string; showOnHomepage?: boolean; tripSlugs: string[] };

export const getFeaturedGroups = cache(async (): Promise<FeaturedGroup[]> => {
  const index = await getJson<{
    data?: { featuredTags?: { slug: string; name: string; description?: string | null; activity?: { slug: string }[] }[] };
  }>("/featured?page=1&limit=50&includeActivity=true");
  if (index?.data?.featuredTags) {
    return index.data.featuredTags
      .map((t) => ({ slug: t.slug, label: t.name, description: t.description ?? undefined, tripSlugs: (t.activity ?? []).map((a) => a.slug) }))
      .filter((g) => g.tripSlugs.length > 0);
  }

  const footer = await getJson<{ data?: { autoItems?: NavItem[] } }>("/footer");
  const fromFooter = (footer?.data?.autoItems ?? [])
    .filter((i) => i.id.startsWith("featuredtag-"))
    .map((i) => ({
      slug: i.id.replace(/^featuredtag-/, ""),
      label: i.label,
      tripSlugs: (i.children ?? [])
        .map((c) => c.url.match(/\/trip\/([^/?#]+)/)?.[1])
        .filter((s): s is string => Boolean(s)),
    }))
    .filter((g) => g.tripSlugs.length > 0);
  if (fromFooter.length) return fromFooter;

  // A footer with saved custom items has no autoItems, so read the tags off
  // each trip's detail (cached like the trip pages' own fetches).
  const { trips } = await getTrips({ limit: 50 });
  const details = await Promise.all(trips.map((t) => getTrip(t.slug)));
  const groups = new Map<string, FeaturedGroup & { order: number }>();
  for (const trip of details) {
    for (const tag of trip?.featuredTags ?? []) {
      const g = groups.get(tag.slug) ?? {
        slug: tag.slug,
        label: tag.name,
        description: tag.description,
        showOnHomepage: tag.showOnHomepage,
        order: tag.order ?? Number.MAX_SAFE_INTEGER,
        tripSlugs: [],
      };
      g.tripSlugs.push(trip!.slug);
      groups.set(tag.slug, g);
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ slug: g.slug, label: g.label, description: g.description, showOnHomepage: g.showOnHomepage, tripSlugs: g.tripSlugs }));
});

/* ---------- People & words ---------- */

export type Testimonial = { id: string; author: string; content: string; rating: number; media?: string; createdAt: string };

// `total` is the API's count of every published testimonial, not just this page.
export const getTestimonials = cache(async (): Promise<{ testimonials: Testimonial[]; total: number }> => {
  const body = await getJson<{ data?: Testimonial[]; pagination?: { total?: number } }>("/testimonial?page=1&limit=50");
  const testimonials = body?.data ?? [];
  return { testimonials, total: body?.pagination?.total ?? testimonials.length };
});

export type TeamMember = {
  id: string;
  name: string;
  designation?: string;
  about?: string;
  image?: string | null;
  department?: { name?: string } | null;
};

export const getTeam = cache(async (): Promise<{ department: string; members: TeamMember[] }[]> => {
  const body = await getJson<{ data?: Record<string, TeamMember[]> }>("/team");
  return Object.entries(body?.data ?? {}).map(([key, members]) => ({
    department: key === "__unassigned__" ? "" : (members[0]?.department?.name ?? key),
    members,
  }));
});

export type BlogSummary = {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  publishedAt?: string | null;
  metaDescription?: string | null;
  author?: { name?: string | null } | null;
  writer?: { name?: string | null } | null;
  category?: { categoryName?: string | null; categoryHandle?: string | null } | null;
};

export type Blog = BlogSummary & { content: string; metaTitle?: string };

export const getBlogs = cache(async (limit = 50): Promise<BlogSummary[]> => {
  const body = await getJson<{ blogs?: BlogSummary[] }>(`/blogs/published?page=1&limit=${limit}`);
  return body?.blogs ?? [];
});

export const getBlog = cache(async (slug: string): Promise<Blog | null> => {
  const body = await getJson<Blog & { data?: Blog }>(`/blogs/${encodeURIComponent(slug)}`);
  const blog = body?.data ?? body;
  return blog?.slug ? blog : null;
});

export type InfoPage = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export const getInfoPages = cache(async (): Promise<InfoPage[]> => {
  const body = await getJson<{ infoPages?: InfoPage[] }>("/info-page?published=true&limit=100");
  return body?.infoPages ?? [];
});

export const getInfoPage = cache(async (slug: string): Promise<InfoPage | null> => {
  const body = await getJson<{ infoPage?: InfoPage }>(`/info-page/slug/${encodeURIComponent(slug)}`);
  return body?.infoPage ?? null;
});

/* ---------- Homepage ---------- */

export type HomeSection = {
  type: "featuredTag" | "tripCategory" | "country" | "region" | "city";
  id: string;
  title: string;
  description: string | null;
  image?: string | null;
  trips: TripSummary[];
};

export const getHomeSections = cache(async (): Promise<HomeSection[]> => {
  const body = await getJson<{ data?: { sections?: HomeSection[] } }>("/homepage/sections?page=1&limit=50");
  return (body?.data?.sections ?? []).map((s) => ({
    ...s,
    trips: (s.trips ?? []).map((t) => ({ ...t, images: parseJson<string[]>(t.images, []) })),
  }));
});

// Resolves a dashboard "trips by slug/tag" spec ("a-slug, b-slug" / "best-selling")
// against the loaded trips. Returns null when the spec is empty.
export function tripsForSpec(
  spec: { tripSlugs?: string; tags?: string } | undefined,
  trips: TripSummary[],
  groups: FeaturedGroup[],
): TripSummary[] | null {
  const list = (v?: string) => (v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const slugs = [
    ...list(spec?.tripSlugs),
    ...list(spec?.tags).flatMap((tag) => groups.find((g) => g.slug === tag)?.tripSlugs ?? []),
  ];
  if (!slugs.length) return null;
  const bySlug = new Map(trips.map((t) => [t.slug, t]));
  return [...new Set(slugs)].map((s) => bySlug.get(s)).filter((t): t is TripSummary => Boolean(t));
}
