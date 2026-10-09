export type AtAGlanceRow = {
  day: string;
  destination: string;
  maxAltitude: string;
};

export type ItineraryDay = {
  id: string;
  label: string;
  title: string;
  description: string;
  meta?: string[];
};

export type TripInfoCard = {
  title: string;
  text: string;
};

export type Review = {
  name: string;
  country: string;
  text: string;
};

export type MoreAdventure = {
  id: string;
  title: string;
  days: string;
  fromPrice: string;
};

export type TrekDetailData = {
  breadcrumbs: { label: string; href: string }[];
  title: string;
  days: string;
  rating: number;
  reviewCount: number;

  maxAltitude: string;
  difficulty: string;
  groupSize: string;
  startEnd: string;

  overview: string[];
  highlights: string[];
  atAGlance: AtAGlanceRow[];
  itinerary: ItineraryDay[];
  tripInformation: TripInfoCard[];
  reviews: Review[];
  moreAdventures: MoreAdventure[];
};
