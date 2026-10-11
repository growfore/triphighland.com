// Mirrors tripeleven/storefront/lib/site-content.ts — the shape the dashboard
// writes to siteConfig.content. Keep in sync when the dashboard grows fields.
export type SiteContent = {
  sectionOrder?: string[];
  hiddenSections?: string[];
  hero?: {
    searchPlaceholder?: string;
    exploreButton?: string;
    rotatingPlaces?: string;
    searchHero?: { badge?: string; headline?: string };
    centeredSearch?: { badge?: string; headline?: string };
    splitEditorial?: { eyebrow?: string; headline?: string; accent?: string; cta?: string };
    fullscreenOverlay?: { eyebrow?: string; headline?: string; sub?: string; cta?: string };
    videoSearch?: { eyebrow?: string; headline?: string };
    textHero?: { eyebrow?: string; headline?: string; sub?: string; cta?: string; secondaryCta?: string; trustCount?: string; trustLabel?: string };
  };
  sections?: {
    // dashboard-added "trips by slug/tag" sections (ids like customTrips-<ts>)
    [id: string]: unknown;
    featured?: { eyebrow?: string; title?: string; description?: string; viewAll?: string; tripSlugs?: string; tags?: string };
    featuredRail?: { eyebrow?: string; title?: string; description?: string; exploreAll?: string; tripSlugs?: string; tags?: string };
    destinations?: { eyebrow?: string; title?: string; description?: string };
    regions?: { eyebrow?: string; title?: string; description?: string };
    countries?: { eyebrow?: string; title?: string; description?: string };
    categories?: { eyebrow?: string; title?: string; description?: string };
    stats?: {
      years?: string;
      destinations?: string;
      trips?: string;
      travelers?: string;
      yearsValue?: string;
      destinationsValue?: string;
      tripsValue?: string;
      travelersValue?: string;
    };
    whyUs?: {
      eyebrow?: string;
      title?: string;
      description?: string;
      features?: { title?: string; description?: string }[];
    };
    tripOfMonth?: { eyebrow?: string; title?: string; description?: string; subtitle?: string; viewItinerary?: string; tripSlugs?: string; tags?: string };
    testimonials?: { eyebrow?: string; title?: string; description?: string };
    blog?: { eyebrow?: string; title?: string; description?: string; allArticles?: string };
    newsletter?: { eyebrow?: string; title?: string; description?: string };
    featuredCard?: { viewItinerary?: string };
  };
  tripPage?: {
    sectionLabels?: {
      overview?: string;
      highlights?: string;
      itinerary?: string;
      included?: string;
      excluded?: string;
      goodToKnow?: string;
      addons?: string;
    };
    facts?: {
      duration?: string;
      difficulty?: string;
      groupSize?: string;
      maxAltitude?: string;
      startPoint?: string;
      accommodation?: string;
      meals?: string;
    };
    sidebar?: {
      from?: string;
      perPerson?: string;
      note?: string;
      bookWhatsApp?: string;
      bookNow?: string;
      talkToExpert?: string;
    };
    split?: { bookWhatsApp?: string; bookNow?: string };
  };
  nav?: { home?: string; bookNow?: string; menu?: string; openMenu?: string };
  footer?: { linksHeading?: string; copyright?: string };
  newsletter?: { placeholder?: string; button?: string; success?: string; error?: string };
  tripCard?: { currency?: string; priceOnRequest?: string };
  // Homepage reference section copy (editable from Settings > Homepage).
  // Section titles backed by data (categories, regions, countries, testimonials,
  // posts) live on their manager pages, not here.
  home?: {
    hero?: { badge?: string; headline?: string; image?: string };
    benefits?: { items?: { title?: string; copy?: string; icon?: string }[] };
    trust?: { title?: string };
    routes?: { eyebrow?: string; title?: string; subtitle?: string };
    about?: {
      image?: string;
      eyebrow?: string;
      title?: string;
      copy?: string;
      points?: string[];
      ctaLabel?: string;
      ctaUrl?: string;
    };
    information?: {
      image?: string;
      eyebrow?: string;
      title?: string;
      copy?: string;
      ctaLabel?: string;
      ctaUrl?: string;
    };
  };
  // Inner-page page headers (editable from the trips / inquiries / posts pages).
  pageHeaders?: {
    explore?: PageHeaderFields;
    contact?: PageHeaderFields;
    booking?: PageHeaderFields;
    blog?: PageHeaderFields;
    documents?: PageHeaderFields;
    ourTeam?: PageHeaderFields;
  };
};

export type PageHeaderFields = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  /** Optional rich-text block rendered at the bottom of the page, after the main list. */
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
};

// ponytail: no deep default nesting — callers use ?? "literal" inline.
// This exists so the dashboard form knows the shape and the storefront
// can surface the full object to the API.
