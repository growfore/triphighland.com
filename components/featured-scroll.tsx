"use client";

import TripCard from "@/components/cards/trip-card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function FeaturedScroll({ activities }: { activities: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 justify-start overflow-x-auto scrollbar-hide items-start"
      >
        {activities.map((activity: any, index: number) => (
          <div key={index}>
            <TripCard key={activity.id} tour={activity} />
          </div>
        ))}
      </div>

      {/* Button Group */}
      <div className="flex gap-4 items-center justify-center mb-12">
        <Button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="bg-primary group flex items-center gap-2 overflow-hidden rounded-full hover:bg-primary text-primary border h-12 w-12 hover:w-32 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="text-white" />
          <span className="hidden group-hover:block group-hover:text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-150 font-black whitespace-nowrap">
            Prev
          </span>
        </Button>
        <Button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="bg-primary  group flex items-center gap-2 overflow-hidden rounded-full hover:bg-primary text-primary border h-12 w-12 hover:w-32 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="hidden group-hover:block group-hover:text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-150 font-black whitespace-nowrap">
            Next
          </span>
          <ChevronRight className="text-white" />
        </Button>
        <Link href="/explore">
          <Button className="w-32  cursor-pointer h-12">Explore all</Button>
        </Link>
      </div>
    </>
  );
}
