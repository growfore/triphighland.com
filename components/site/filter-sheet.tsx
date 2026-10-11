"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// Small-screen home for the explore filters: an icon button that opens them in
// a bottom sheet. The filters are plain links, so any tap navigates and closes.
export default function FilterSheet({ active, children }: { active: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={active ? `Filters (${active} active)` : "Filters"}
        className="relative flex size-11 flex-none items-center justify-center border border-line hover:border-ink"
      >
        <SlidersHorizontalIcon size={18} strokeWidth={1.8} />
        {active > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-paper">
            {active}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] gap-0 rounded-none bg-paper">
        <div className="border-b border-line px-5 py-4">
          <SheetTitle className="text-[17px] font-semibold">Filters</SheetTitle>
          <SheetDescription className="sr-only">Narrow journeys by style and destination</SheetDescription>
        </div>
        <div
          className="overflow-y-auto overscroll-contain px-5 pb-8 pt-6"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
