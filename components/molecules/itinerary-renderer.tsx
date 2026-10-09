import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  
  export type ItineraryItem = {
    day: number;
    title: string;
    description: string;
  };
  export const ItineraryRenderer = ({
    item,
    index,
  }: {
    item: ItineraryItem;
    index: string;
  }) => {
    return (
      <div className="flex gap-1 relative border-b">
        <AccordionItem value={index} >
          <AccordionTrigger className="rounded-none font-bold text-xl hover:no-underline cursor-pointer">
            Day {Number(index) + 1}: {item.title}
          </AccordionTrigger>
          <AccordionContent>
            <div dangerouslySetInnerHTML={{ __html: item.description }} />
          </AccordionContent>
        </AccordionItem>
      </div>
    );
  };
  