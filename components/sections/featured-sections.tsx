import { cn } from "@/lib/utils";
import FeaturedScroll from "../featured-scroll";

export default async function FeaturedSections({
  featuredTags,
}: {
  featuredTags: any;
}) {
  return (
    <div className="relative flex flex-col gap-4 justify-center container mx-auto p-4">
      {featuredTags.map((tag: any, index: number) => (
        <div key={index} className="space-y-4">
          <div className="flex justify-between items-baseline-last py-8 flex-col md:flex-row">
            <div className="flex flex-col gap-4">
              <div className="text-2xl md:text-3xl font-black uppercase">
                {tag.name}
              </div>
              <div className={cn("md:max-w-4xl text-lg font-medium ")}>
                {tag.description}
              </div>
            </div>
          </div>
          <FeaturedScroll activities={tag.activity} />
        </div>
      ))}
    </div>
  );
}
