import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { decodeHtmlEntities } from "@/lib/htmlDecoder";

export type AdditionalInfoItem = {
  title: string;
  description: string;
};

export const AdditionalInfoRenderer = ({
  item,
}: {
  item: AdditionalInfoItem;
}) => {
  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <div className="flex gap-1 relative border-b">
          <AccordionItem value="item-1" className="w-full">
            <AccordionTrigger className="hover:no-underline cursor-pointer">
              <div className="text-lg font-semibold">{item.title}</div>
            </AccordionTrigger>
            <AccordionContent>
              <div
                className="text-lg tracking-wider"
                dangerouslySetInnerHTML={{
                  __html: decodeHtmlEntities(item.description),
                }}
              />
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </>
  );
};
