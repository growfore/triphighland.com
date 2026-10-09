import { apiFetch } from "@/lib/api";
export const dynamic = "force-static";

import Hero from "@/components/hero";
import WelcomeSection from "../sections/welcome-section";
import WhyUsSection from "../sections/why-us";
import FeaturedSections from "../sections/featured-sections";
import TripOfTheMonth from "../featured-trip";
import Testimonials from "../testimonial-section";
import TripTypeCarousel from "../gallery/triptype-carousel";

export default async function Homepage() {
  let data;
  try {
    const res = await apiFetch(`/featured?includeActivity=true`,
    );

    data = await res.json();
  } catch (error) {
    console.log("Error: ", error);
    return;
  }

  const featured = data?.data;
  const featuredWithoutTOM = featured.featuredTags.filter(
    (tag: any) => tag.slug !== "trip-of-the-month",
  );
  const firstFeatured = featuredWithoutTOM.slice(0, 1);
  const secondFeatured = featuredWithoutTOM.slice(1, 2);
  const thirdFeatured = featuredWithoutTOM.slice(2, 10);
  return (
    <div>
      <Hero />
      <WhyUsSection />
      <WelcomeSection />
      <div className="bg-accent/10 min-h-[50vh] flex items-center justify-center">
        <TripTypeCarousel />
      </div>
      <FeaturedSections featuredTags={firstFeatured} />
      <TripOfTheMonth />
      <FeaturedSections featuredTags={secondFeatured} />
      <div className="bg-primary/20 py-12 ">
        <Testimonials />
      </div>

      <FeaturedSections featuredTags={thirdFeatured} />
    </div>
  );
}
