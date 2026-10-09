import type { SiteContent } from "@/lib/site-content";

// Every UI string the tenant can override from the TripEleven dashboard,
// resolved once. Fallbacks only apply when the dashboard field is empty.
export function getLabels(content: SiteContent) {
  const s = content.sections ?? {};
  const tp = content.tripPage ?? {};
  return {
    card: {
      currency: content.tripCard?.currency || "$",
      priceOnRequest: content.tripCard?.priceOnRequest || "Price on request",
      viewItinerary: s.featuredCard?.viewItinerary || s.tripOfMonth?.viewItinerary || "View itinerary",
      from: tp.sidebar?.from || "From",
      perPerson: tp.sidebar?.perPerson || "per person",
    },
    trip: {
      overview: tp.sectionLabels?.overview || "Overview",
      highlights: tp.sectionLabels?.highlights || "Highlights",
      itinerary: tp.sectionLabels?.itinerary || "Itinerary",
      included: tp.sectionLabels?.included || "Included",
      excluded: tp.sectionLabels?.excluded || "Excluded",
      goodToKnow: tp.sectionLabels?.goodToKnow || "Good to know",
      duration: tp.facts?.duration || "Duration",
      difficulty: tp.facts?.difficulty || "Difficulty",
      groupSize: tp.facts?.groupSize || "Group size",
      maxAltitude: tp.facts?.maxAltitude || "Max altitude",
      startPoint: tp.facts?.startPoint || "Start point",
      accommodation: tp.facts?.accommodation || "Accommodation",
      meals: tp.facts?.meals || "Meals",
      note: tp.sidebar?.note,
      bookNow: tp.sidebar?.bookNow || tp.split?.bookNow || "Send enquiry",
      bookWhatsApp: tp.sidebar?.bookWhatsApp || tp.split?.bookWhatsApp || "WhatsApp",
      talkToExpert: tp.sidebar?.talkToExpert || "Enquire",
    },
    newsletter: {
      title: s.newsletter?.title || "",
      description: s.newsletter?.description || "",
      placeholder: content.newsletter?.placeholder || "Your email",
      button: content.newsletter?.button || "Subscribe →",
      success: content.newsletter?.success || "Thank you — you’re subscribed.",
      error: content.newsletter?.error || "Couldn’t subscribe right now. Please try again.",
    },
    footer: {
      linksHeading: content.footer?.linksHeading || "Contact",
      copyright: content.footer?.copyright,
    },
  };
}

export type Labels = ReturnType<typeof getLabels>;
export type CardLabels = Labels["card"];
