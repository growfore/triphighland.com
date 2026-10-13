import type { Metadata } from "next";
import PageHeader from "@/components/site/page-header";
import ItineraryForm from "@/components/design-your-trip/itinerary-form";
import { getCategories, getSiteConfig } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Design your trip",
  description: "Tell us where, when and how you like to travel, and our local team will craft a custom itinerary around you.",
  alternates: { canonical: "/design-your-trip" },
};

export default async function DesignYourTripPage() {
  const [config, categories] = await Promise.all([getSiteConfig(), getCategories()]);
  return (
    <main>
      <PageHeader
        title="Plan your custom itinerary"
        standfirst="Tell us your dream adventure and we'll craft a personalised trek just for you — dates, pace, locations, and every detail."
      />
      <ItineraryForm
        // The API's catch-all placeholder category isn't a real choice.
        categories={categories.filter((c) => c.categoryHandle !== "default")}
        contact={{
          email: config.email ?? "",
          phoneNumber: config.phoneNumbers[0]?.number ?? "",
          fullAddress: config.fullAddress ?? "",
          openHours: config.openHours ?? "",
        }}
      />
    </main>
  );
}
