"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { caveat } from "@/lib/font";
import { cn } from "@/lib/utils";

interface TripType {
  id: string;
  tripTypeHandle: string;
  tripTypeName: string;
  tripTypeImage: string | null;
}

interface Props {
  tripTypes: TripType[];
}

export default function TripTypeCarouselClient({ tripTypes }: Props) {
  const autoplayRef = useRef(
    Autoplay({ delay: 2800, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [autoplayRef.current],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="w-full py-10 container mx-auto">
      <h2 className="font-bold  text-xl uppercase mb-6 leading-tight text-balance text-center">
        I can make your experience unique by organizing
      </h2>

      <div className="relative px-10">
        {/* Prev button */}
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* Embla viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {tripTypes.map((trip, index) => (
              <div
                key={trip.id + index}
                className="flex-none w-40 md:w-60 cursor-pointer group pl-4"
              >
                <div
                  className={cn(
                    "flex-none group relative overflow-hidden rounded-2xl aspect-4/5 bg-muted shadow-md",
                    // index == tripTypes?.length - 1 ? "mr-4" : "",
                  )}
                >
                  {trip.tripTypeImage ? (
                    <Image
                      src={trip.tripTypeImage}
                      alt={trip.tripTypeName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 160px, 192px"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-3">
                    <span className="text-lg font-semibold text-white drop-shadow">
                      {trip.tripTypeName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>
    </section>
  );
}
