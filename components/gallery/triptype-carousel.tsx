import { apiFetch } from "@/lib/api";
import TripTypeCarouselClient from "./trip-type-carousel-client";

interface TripType {
  id: string;
  tripTypeHandle: string;
  tripTypeName: string;
  tripTypeImage: string | null;
}

async function getTripTypes(): Promise<TripType[]> {
  const res = await apiFetch(`/trip-type`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch trip types");
  const json = await res.json();
  return json.data.tripTypes as TripType[];
}

export default async function TripTypeCarousel() {
  const tripTypes = await getTripTypes();
  // Filter out types with no image and skip "Default"
  const filtered = tripTypes.filter(
    (t) => t.tripTypeImage && t.tripTypeHandle !== "default",
  );
  return <TripTypeCarouselClient tripTypes={filtered} />;
}
