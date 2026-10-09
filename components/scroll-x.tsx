"use client";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import TestimonialCard from "./testimonial-card";
import Link from "next/link";

export default function ScrollableTestmonials({
  testimonials,
}: {
  testimonials: any[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);

    autoScrollRef.current = setInterval(() => {
      if (isPausedRef.current || !scrollRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      scrollRef.current.scrollBy({
        left: atEnd ? -scrollWidth : 400,
        behavior: "smooth",
      });
    }, 3000);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    startAutoScroll();

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [startAutoScroll]);

  const pauseTemporarily = () => {
    isPausedRef.current = true;
    setTimeout(() => {
      isPausedRef.current = false;
    }, 5000); // resume after 5s of inactivity
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    pauseTemporarily();
    scrollRef.current.scrollBy({
      left: direction === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={scrollRef}
        className="flex gap-4 justify-start overflow-x-auto scrollbar-hide items-start"
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
        }}
        onTouchStart={() => pauseTemporarily()}
      >
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            name={testimonial.author}
            review={testimonial.content}
            rating={testimonial.rating}
          />
        ))}
      </div>
      {/* Button Group */}
      <div className="flex justify-between items-center">
        <div className="flex gap-1 items-start justify-start">
          <Button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="size-8 rounded-full"
          >
            <ChevronLeft />
          </Button>
          <Button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="size-8 rounded-full"
          >
            <ChevronRight />
          </Button>
        </div>
        <Link href={"/about-us"}>
          <Button className="w-fit rounded-xs font-bold">
            More about Gobinda <ChevronRight />
          </Button>
        </Link>
      </div>
    </div>
  );
}
