import { permanentRedirect } from "next/navigation";

// Trips moved to /trip/<slug> (TripEleven's menu and footer link there).
export default async function LegacyPackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/trip/${slug}`);
}
