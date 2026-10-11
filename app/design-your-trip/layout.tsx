import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Design your trip",
  description: "Tell us where, when and how you like to travel, and our local team will craft a custom itinerary around you.",
  alternates: { canonical: "/design-your-trip" },
};

export default function DesignYourTripLayout({ children }: { children: React.ReactNode }) {
  return children;
}
