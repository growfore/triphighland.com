import { ScrollArea } from "./ui/scroll-area";

export default function TestimonialCard({
  name,
  review,
  rating,
}: {
  name: string;
  review: string;
  rating: number;
}) {
  const stars = Array.from({ length: rating });

  return (
    <div className="max-w-md space-y-1.5 min-w-sm rounded-sm">
      <div className="bg-gray-100 p-4  space-y-3 relative rounded-xl">
        <div className="flex gap-1">
          {stars.map((_, index) => {
            return (
              <div key={index} className="size-4 bg-green-700 rounded-full" />
            );
          })}
        </div>
        <div className="text-black">
          <ScrollArea className="h-64 italic text-lg">{review}</ScrollArea>
        </div>

        <div className="flex gap-4 items-center border-t pt-4">
          <div className="rounded-full size-16 bg-primary/20 flex items-center justify-center text-black font-black">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="text-black">
            <p className="font-bold">{name}</p>
            {/*<p className="text-sm">20th Dec, 2024</p>*/}
          </div>
        </div>
      </div>
    </div>
  );
}
