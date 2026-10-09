import type { ReactNode } from "react";
import {
  getBlogs,
  getCategories,
  getCities,
  getCountries,
  getFeaturedGroups,
  getHomeSections,
  getSiteConfig,
  getTeam,
  getTestimonials,
  getTrip,
  getTrips,
  tripsForSpec,
} from "@/lib/site";
import { getLabels } from "@/lib/labels";
import { whatsappLink } from "@/lib/media";
import {
  CategoryTiles,
  CustomSection,
  Destinations,
  Featured,
  FeaturedRail,
  Hero,
  Information,
  Journal,
  Newsletter,
  Plan,
  Stats,
  Testimonials,
  TripOfMonth,
  WhyUs,
  type HomeCtx,
} from "@/components/home/sections";

export const revalidate = 300;

// Used only when the dashboard has never saved a section order.
const DEFAULT_ORDER = ["whyUs", "categoryTiles", "tripOfMonth", "featured", "featuredRail", "testimonials", "blog", "newsletter"];

export default async function HomePage() {
  const [config, { trips, total }, groups, categories, countries, cities, testimonials, team, blogs, homeSections] =
    await Promise.all([
      getSiteConfig(),
      getTrips({ limit: 50 }),
      getFeaturedGroups(),
      getCategories(),
      getCountries(),
      getCities(),
      getTestimonials(),
      getTeam(),
      getBlogs(3),
      getHomeSections(),
    ]);
  const content = config.content;
  const labels = getLabels(content);

  const tom = tripsForSpec(content.sections?.tripOfMonth, trips, groups)?.[0] ?? trips[0];
  const feature = tom ? await getTrip(tom.slug) : null;

  // API images only: trip photos first, then taxonomy imagery.
  const pool = [
    ...trips.flatMap((t) => t.images),
    ...categories.map((c) => c.categoryImage),
    ...cities.map((c) => c.cityImage),
    ...countries.map((c) => c.countryImage),
  ].filter((s, i, all): s is string => Boolean(s) && all.indexOf(s) === i);

  const ctx: HomeCtx = {
    config,
    labels,
    trips,
    total,
    groups,
    categories,
    // Cities only; countries are not shown on the homepage.
    destinations: cities.map((c) => ({ key: `city:${c.cityHandle}`, name: c.cityName, image: c.cityImage, href: `/explore?city=${c.cityHandle}` })),
    testimonials,
    guide: team.flatMap((d) => d.members).find((m) => m.image) ?? team[0]?.members[0],
    blogs,
    homeSections,
    feature,
    whatsapp: whatsappLink(config.whatsAppNumber),
    pick: (i) => (pool.length ? pool[i % pool.length] : undefined),
  };

  const hidden = new Set(content.hiddenSections ?? []);
  const order = (content.sectionOrder?.length ? content.sectionOrder : DEFAULT_ORDER).filter((id) => !hidden.has(id));
  // whyUs doubles as the about block; keep home.about visible even if the
  // dashboard order leaves whyUs out.
  if (!order.includes("whyUs") && !hidden.has("whyUs") && (content.home?.about?.title || content.home?.about?.copy)) order.unshift("whyUs");
  const s = content.sections ?? {};

  const render = (id: string): ReactNode => {
    switch (id) {
      case "whyUs":
        return <WhyUs ctx={ctx} />;
      case "featured":
        return <Featured ctx={ctx} />;
      case "featuredRail":
        return <FeaturedRail ctx={ctx} />;
      case "categories":
      case "categoryTiles":
        return <CategoryTiles ctx={ctx} />;
      case "destinations":
      case "countries":
      case "regions":
        return <Destinations ctx={ctx} copy={s[id] as { title?: string }} />;
      case "stats":
        return <Stats ctx={ctx} />;
      case "tripOfMonth":
        return <TripOfMonth ctx={ctx} />;
      case "testimonials":
        return <Testimonials ctx={ctx} />;
      case "blog":
        return <Journal ctx={ctx} />;
      case "newsletter":
        return <Newsletter ctx={ctx} />;
      default:
        return <CustomSection ctx={ctx} id={id} />;
    }
  };

  return (
    <main>
      <Hero ctx={ctx} />
      {order.map((id) => (
        <div key={id} data-section={id}>
          {render(id)}
        </div>
      ))}
      {!order.includes("destinations") && !order.includes("countries") && <Destinations ctx={ctx} copy={s.destinations} />}
      <Information ctx={ctx} />
      <Plan ctx={ctx} />
    </main>
  );
}
