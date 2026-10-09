import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { decodeHtmlEntities } from "@/lib/htmlDecoder";

export type FaqItem = {
  question: string;
  answer: string;
};
export const FAQRenderer = ({
  item,
  index,
}: {
  item: FaqItem;
  index: string;
}) => {
  return (
    <AccordionItem value={index} className="w-full">
      <AccordionTrigger className="cursor-pointer text-lg tracking-wider font-semibold">
        {item.question}
      </AccordionTrigger>
      <AccordionContent>
        <div
          className="text-lg tracking-wider"
          dangerouslySetInnerHTML={{
            __html: decodeHtmlEntities(item.answer),
          }}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
