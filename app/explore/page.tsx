import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getCities, getCountries, getSiteConfig, getTrips } from "@/lib/site";
import PageHeader, { PageFooterContent } from "@/components/site/page-header";
import { getLabels } from "@/lib/labels";
import TripCard from "@/components/site/trip-card";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const h = (await getSiteConfig()).content.pageHeaders?.explore;
  return {
    title: h?.metaTitle || "Explore journeys",
    description: h?.metaDescription || undefined,
    alternates: { canonical: "/explore" },
  };
}

type Search = { search?: string; category?: string; country?: string; city?: string; where?: string; page?: string };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  // The homepage search sends where=country:nepal / city:kathmandu.
  const [whereKey, whereVal] = (sp.where ?? "").split(":");
  const filters = {
    search: sp.search?.trim() || undefined,
    category: sp.category || undefined,
    country: sp.country || (whereKey === "country" ? whereVal : undefined),
    city: sp.city || (whereKey === "city" ? whereVal : undefined),
  };
  const page = Math.max(1, Number(sp.page) || 1);

  const [config, { trips, totalPages, total }, countries, cities, categories] = await Promise.all([
    getSiteConfig(),
    getTrips({ ...filters, page, limit: 12 }),
    getCountries(),
    getCities(),
    getCategories(),
  ]);
  const header = config.content.pageHeaders?.explore;
  const labels = getLabels(config.content);

  const href = (patch: Partial<Search>) => {
    const next = { ...filters, page: undefined as string | undefined, ...patch };
    const qs = new URLSearchParams(
      Object.entries(next).filter((e): e is [string, string] => Boolean(e[1])),
    ).toString();
    return `/explore${qs ? `?${qs}` : ""}`;
  };
  const styles = categories.filter((c) => c.categoryHandle !== "default");
  const hasFilters = Object.values(filters).some(Boolean);
  const chipRow = "-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0";

  return (
    <main>
      <PageHeader
        fields={header}
        title="Explore"
      >
        <form action="/explore" role="search" className="mt-10 flex max-w-[620px] items-center gap-2 bg-white p-2 pl-6 text-ink">
          {filters.category && <input type="hidden" name="category" value={filters.category} />}
          {filters.country && <input type="hidden" name="country" value={filters.country} />}
          {filters.city && <input type="hidden" name="city" value={filters.city} />}
          <label htmlFor="explore-search" className="sr-only">Search journeys</label>
          <input
            id="explore-search"
            name="search"
            type="search"
            defaultValue={filters.search}
            placeholder="Search by trek or place"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-muted"
          />
          <button type="submit" className="btn-primary h-12 px-6">
            <SearchIcon size={18} strokeWidth={2} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>
      </PageHeader>

      <section className="wrap py-12 lg:py-20">
        <div className="flex flex-col gap-6 border-b border-line pb-8">
          {styles.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="meta w-28 flex-none text-[12px] text-ink-muted">Style</span>
              <div role="group" aria-label="Trip style" className={chipRow}>
                <Link href={href({ category: undefined })} className="chip" aria-pressed={!filters.category}>
                  Any style
                </Link>
                {styles.map((c) => (
                  <Link key={c.id} href={href({ category: c.categoryHandle })} className="chip" aria-pressed={filters.category === c.categoryHandle}>
                    {c.categoryName}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(countries.length > 0 || cities.length > 0) && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="meta w-28 flex-none text-[12px] text-ink-muted">Destination</span>
              <div className="flex min-w-0 flex-col gap-3">
                <div role="group" aria-label="Country" className={chipRow}>
                  <Link href={href({ country: undefined, city: undefined })} className="chip" aria-pressed={!filters.country && !filters.city}>
                    Anywhere
                  </Link>
                  {countries.map((c) => (
                    <Link
                      key={c.id}
                      href={href({ country: c.countryHandle, city: undefined })}
                      className="chip"
                      aria-pressed={filters.country === c.countryHandle}
                    >
                      {c.countryName}
                    </Link>
                  ))}
                </div>
                {cities.length > 0 && (
                  // Many cities: tucked behind a toggle, open when one is chosen.
                  <details className="group" open={Boolean(filters.city)}>
                    <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-[14px] font-medium text-highland-deep [&::-webkit-details-marker]:hidden">
                      More places
                      <ChevronDownIcon size={16} strokeWidth={1.8} className="transition group-open:rotate-180" />
                    </summary>
                    <div role="group" aria-label="Place" className={`${chipRow} mt-3`}>
                      {cities.map((c) => (
                        <Link
                          key={c.id}
                          href={href({ city: c.cityHandle, country: undefined })}
                          className="chip"
                          aria-pressed={filters.city === c.cityHandle}
                        >
                          {c.cityName}
                        </Link>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-[14px]">
            <p className="text-ink-muted" aria-live="polite">
              {total} {total === 1 ? "journey" : "journeys"}
              {filters.search ? ` for “${filters.search}”` : ""}
            </p>
            {hasFilters && (
              <Link href="/explore" className="inline-flex items-center gap-1.5 font-medium text-highland-deep hover:underline">
                <XIcon size={14} strokeWidth={2} />
                Clear filters
              </Link>
            )}
          </div>
        </div>

        {trips.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:mt-16">
            {trips.map((t) => (
              <TripCard key={t.id} trip={t} labels={labels.card} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="display text-xl">No journeys match</p>
            <p className="standfirst mx-auto mt-3 max-w-[420px]">
              {filters.search ? `Nothing found for “${filters.search}”. ` : ""}Try another style or place — or tell us what you have in mind.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              {hasFilters && (
                <Link href="/explore" className="btn-outline">
                  Clear filters
                </Link>
              )}
              <Link href="/design-your-trip" className="btn-dark">
                Design my trek
              </Link>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="meta mt-16 flex items-center justify-between border-t border-ink pt-6 text-[14px]">
            {page > 1 ? <Link href={href({ page: String(page - 1) })} className="inline-flex items-center gap-2"><ArrowLeftIcon size={14} strokeWidth={1.8} /> Prev</Link> : <span />}
            <span className="text-ink-muted">
              {page} / {totalPages}
            </span>
            {page < totalPages ? <Link href={href({ page: String(page + 1) })} className="inline-flex items-center gap-2">Next <ArrowRightIcon size={14} strokeWidth={1.8} /></Link> : <span />}
          </nav>
        )}
      </section>
      <PageFooterContent fields={header} />
    </main>
  );
}
