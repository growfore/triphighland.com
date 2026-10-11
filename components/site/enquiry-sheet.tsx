"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Labels } from "@/lib/labels";
import { whatsappLink } from "@/lib/media";
import EnquiryForm from "./enquiry-form";
import { XIcon } from "lucide-react";

type Props = {
  trips: string[];
  whatsAppNumber?: string;
  heading: { eyebrow?: string; title: string; subtitle?: string };
  labels: Labels["trip"];
};

// Opens from any `[data-enquire]` or `a[href="#enquire"]` click, so server
// components can trigger it with plain markup. Links keep a real href
// (e.g. /booking) for no-JS and modified clicks. A trip page marks its
// <main> with data-enquiry-trip, and the form then asks about that trip.
export default function EnquirySheet({ trips, whatsAppNumber, heading, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [trip, setTrip] = useState<string | undefined>();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const trigger = (e.target as Element | null)?.closest('[data-enquire], a[href="#enquire"]');
      if (!trigger) return;
      e.preventDefault();
      setTrip(document.querySelector<HTMLElement>("[data-enquiry-trip]")?.dataset.enquiryTrip || undefined);
      setOpen(true);
    }
    // Capture phase: runs before next/link's handler, which skips navigation
    // once the event is default-prevented.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto bg-night text-white shadow-2xl data-[state=closed]:duration-300 data-[state=open]:duration-500 sm:max-w-[560px]">
          <div className="flex items-start justify-between gap-6 px-6 pb-2 pt-6 sm:px-10 sm:pt-10">
            <div className="min-w-0">
              {heading.eyebrow && <p className="meta mb-3 text-[12px] text-night-muted">{heading.eyebrow}</p>}
              <Dialog.Title className="display text-[24px] sm:text-[28px]">{heading.title}</Dialog.Title>
              {trip && <p className="mt-3 text-[15px] text-highland">{trip}</p>}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="flex size-11 flex-none items-center justify-center rounded-full border border-white/40 hover:bg-white/10"
            >
              <XIcon size={20} strokeWidth={1.8} />
            </Dialog.Close>
          </div>
          {heading.subtitle ? (
            <Dialog.Description className="px-6 text-base font-light text-[#DCE5EE] sm:px-10">{heading.subtitle}</Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">Send us an enquiry</Dialog.Description>
          )}
          <div className="px-6 pb-10 pt-8 sm:px-10">
            <EnquiryForm
              variant={trip ? "trip" : "plan"}
              trips={trip ? [trip] : trips}
              defaultTrip={trip}
              whatsapp={whatsappLink(whatsAppNumber, trip)}
              labels={labels}
              submitClassName="btn meta bg-highland px-8 py-5 text-[14px] tracking-[0.1em] text-[#0E1F2E] hover:bg-[#6fa5d4] disabled:opacity-60"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
