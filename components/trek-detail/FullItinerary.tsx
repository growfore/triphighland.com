import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionTitle from "./SectionTitle";
import { decodeHtmlEntities } from "@/lib/htmlDecoder";
import { LucideMapPin } from "lucide-react";

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export default function FullItinerary({ days }: { days: ItineraryDay[] }) {
  return (
    <section className="py-2" id="itinerary">
      <SectionTitle title="Detailed Itinerary" />
      <Accordion type="single" collapsible defaultValue="day-1">
        {days.map((d) => (
          <AccordionItem key={d.day} value={`day-${d.day}`}>
            <AccordionTrigger className="hover:no-underline [&[data-state=open]>svg]:rotate-180 py-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/90 p-2  font-semibold text-white">
                  <LucideMapPin className="h-4 w-4" />
                </span>
                <span className="font-semibold text-lg">{d.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: decodeHtmlEntities(d.description),
                }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
