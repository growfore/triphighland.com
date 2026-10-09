import type { TrekDetailData } from "./types";

export const TREK_DETAIL: TrekDetailData = {
  breadcrumbs: [
    { label: "Home", href: "/" },
    { label: "Nepal", href: "/destinations/nepal" },
    { label: "Everest Base Camp Trek", href: "/treks/everest-base-camp" },
  ],

  title: "Everest Base Camp Trek",
  days: "14 Days",
  rating: 4.9,
  reviewCount: 120,

  maxAltitude: "5,364m",
  difficulty: "Challenging",
  groupSize: "2 - 12 pax",
  startEnd: "Kathmandu",

  overview: [
    "The Everest Base Camp Trek is the adventure of a lifetime. This legendary journey takes you through the heart of the Khumbu region, offering unparalleled views of the world’s highest peaks, including Everest, Lhotse, and Nuptse.",
    "Experience the unique Sherpa culture as you pass through ancient monasteries, suspension bridges draped in prayer flags, and bustling market towns like Namche Bazaar. Your journey culminates at the base of the world’s highest peak, surrounded by the Khumbu Icefall.",
  ],

  highlights: [
    "Scenic flight from Kathmandu to Lukla",
    "Sunrise views from Kala Patthar (5,545m)",
    "Standing at Everest Base Camp (5,364m)",
    "Exploring Sherpa culture in Namche Bazaar",
  ],

  atAGlance: [
    { day: "Day 01", destination: "Arrival in Kathmandu", maxAltitude: "1,400m" },
    { day: "Day 02", destination: "Flight to Lukla, Trek to Phakding", maxAltitude: "2,610m" },
    { day: "Day 03", destination: "Trek to Namche Bazaar", maxAltitude: "3,440m" },
    { day: "Day 04", destination: "Acclimatization in Namche", maxAltitude: "3,440m" },
  ],

  itinerary: [
    {
      id: "day-1",
      label: "DAY 01",
      title: "Arrival and Transfer to Hotel",
      description:
        "Arrive in Kathmandu and transfer to your hotel. Meet your guide for a detailed trek briefing and preparation.",
    },
    {
      id: "day-2",
      label: "DAY 02",
      title: "Fly to Lukla and Trek to Phakding",
      description:
        "Early morning flight to Lukla (2,840m). After breakfast, begin the trek to Phakding through beautiful Sherpa villages along the Dudh Koshi River.",
      meta: ["Flight", "4–5 Hours Trek", "Tea House"],
    },
    {
      id: "day-3",
      label: "DAY 03",
      title: "Trek to Namche Bazaar",
      description:
        "Cross several suspension bridges and ascend gradually to Namche Bazaar, the trading hub of the Khumbu region.",
      meta: ["6 Hours Trek", "Mountain Views"],
    },
    {
      id: "day-4",
      label: "DAY 04",
      title: "Acclimatization Day in Namche Bazaar",
      description:
        "Rest and acclimatize in Namche Bazaar. Optional hikes to Everest View Hotel and exploration of Sherpa culture.",
      meta: ["Acclimatization", "Short Hike"],
    },
  ],

  tripInformation: [
    {
      title: "Best Season to Trek",
      text:
        "The best months for Everest Base Camp Trek are March to May (Spring) and September to November (Autumn). During these periods, the weather is stable, skies are clear, and mountain views are at their best.",
    },
    {
      title: "Accommodation",
      text:
        "During the trek, you will stay in local tea houses. These are simple but cozy lodges offering twin-sharing rooms and warm dining halls, perfect for resting after long trekking days.",
    },
  ],

  reviews: [
    {
      name: "John Doe",
      country: "USA",
      text:
        "Absolutely life-changing experience. Our guide was knowledgeable and the views were beyond belief.",
    },
    {
      name: "Sarah Miller",
      country: "UK",
      text:
        "The organization was top-notch. From Lukla flight to Base Camp, everything was perfectly arranged.",
    },
    {
      name: "Alex Lee",
      country: "Australia",
      text:
        "Incredible adventure! The Sherpa culture and scenery made this unforgettable.",
    },
    {
      name: "Karin Van",
      country: "Netherlands",
      text:
        "Best trip I’ve ever taken. Highly recommend TrekNepal for their professional service!",
    },
  ],

  moreAdventures: [
    { id: "annapurna-circuit", title: "Annapurna Circuit Trek", days: "12 Days", fromPrice: "1,250" },
    { id: "gokyo-ebc", title: "Gokyo Lakes & Everest Base Camp", days: "15 Days", fromPrice: "1,650" },
    { id: "manaslu-circuit", title: "Manaslu Circuit Trek", days: "18 Days", fromPrice: "1,380" },
  ],
};
