import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import ScrollableTestmonials from "./scroll-x";

export interface Testimonial {
  id: string;
  author: string;
  rating: number;
  content: string;
}

export default async function Testimonials() {
  const res = await apiFetch(`/testimonial`,
    {
      cache: "force-cache",
    },
  );
  const testimonials = await res.json();

  return (
    <div className="container mx-auto px-4">
      <div className="text-xl md:text-3xl text-left font-black uppercase font-script">
        What Our Trekkers Say
      </div>
      <div className={cn("md:max-w-4xl text-lg font-medium ")}>
        Read about the experiences of our trekkers who have explored the
        majestic Himalayas with us
      </div>
      <div className="mx-auto overflow-x-scroll py-4 scrollbar-hide">
        <ScrollableTestmonials testimonials={testimonials} />
      </div>
    </div>
  );
}
