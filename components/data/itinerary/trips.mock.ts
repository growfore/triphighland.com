export type TripCard = {
  slug: string;
  title: string;
  currencySymbol: string;
  startingFrom: number;
  durationDays: number;
};

export const TRIPS: TripCard[] = [
  {
    slug: "everest-base-camp",
    title: "Everest Base Camp Trek",
    currencySymbol: "$",
    startingFrom: 1450,
    durationDays: 14,
  },
  {
    slug: "annapurna-circuit",
    title: "Annapurna Circuit Trek",
    currencySymbol: "$",
    startingFrom: 1250,
    durationDays: 12,
  },
  {
    slug: "manaslu-circuit",
    title: "Manaslu Circuit Trek",
    currencySymbol: "$",
    startingFrom: 1380,
    durationDays: 18,
  },
];
