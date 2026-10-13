"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { NavItem } from "@/lib/site";
import Photo from "./photo";
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";

// Card details for trips the menu links to, keyed by slug (menu items carry
// only a label and url).
export type MenuTrip = { image?: string; meta: string; price: string };

const tripSlug = (url: string) => url.match(/^\/trip\/([^/?#]+)/)?.[1];

// Every trip link below a node, deduped: the API repeats a trip under each
// city it visits.
function tripsUnder(node: NavItem): NavItem[] {
  const seen = new Set<string>();
  const out: NavItem[] = [];
  const walk = (n: NavItem) => {
    if (tripSlug(n.url) && !seen.has(n.url)) {
      seen.add(n.url);
      out.push(n);
    }
    n.children.forEach(walk);
  };
  node.children.forEach(walk);
  return out;
}

// The auto menu nests Discover → group → place/category → city → trip; the
// plain dropdown only has room for two of those levels.
export function isMega(item: NavItem) {
  return item.children.some((g) => g.children.some((e) => e.children.length > 0));
}

// Two columns of six rows fill the panel; the rest sit behind "Explore more".
const PANEL_TRIPS = 12;

export default function MegaMenu({ item, trips }: { item: NavItem; trips: Record<string, MenuTrip> }) {
  const [open, setOpen] = useState(false);
  const allId = `${item.id}-all`;
  const [entryId, setEntryId] = useState(allId);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const triggerRef = useRef<HTMLAnchorElement>(null);

  // "All trips" heads the list; countries and categories follow, the group
  // label only heading its run.
  const all: NavItem = { id: allId, label: "All trips", url: item.url, children: item.children };
  const entries = [all, ...item.children.flatMap((g) => g.children)];
  const entry = entries.find((e) => e.id === entryId) ?? all;
  const entryTrips = tripsUnder(entry);
  const showGroupLabels = item.children.filter((g) => g.children.length).length > 1;

  const entryLink = (e: NavItem) => {
    const active = e.id === entry.id;
    return (
      <Link
        href={e.url || "#"}
        onPointerEnter={() => setEntryId(e.id)}
        onFocus={() => setEntryId(e.id)}
        aria-current={active ? "true" : undefined}
        className={`block truncate py-2.5 text-[22px] font-semibold leading-tight xl:text-[24px] ${
          active ? "text-ink" : "text-ink-muted/80 hover:text-ink"
        }`}
      >
        {e.label}
      </Link>
    );
  };

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Short grace period so a diagonal move toward the panel doesn't close it.
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="flex self-stretch"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
      // Client navigation keeps the pointer over the panel; close on any link.
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) setOpen(false);
      }}
    >
      <Link
        ref={triggerRef}
        href={item.url || "#"}
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center gap-1.5 border-b-2 pt-0.5 ${open ? "border-highland-deep" : "border-transparent hover:opacity-75"}`}
      >
        {item.label}
        <ChevronDownIcon strokeWidth={1.8} size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </Link>

      <div
        className={`absolute inset-x-0 top-full z-40 border-t border-line-soft bg-white text-left normal-case tracking-normal text-ink shadow-[0_40px_60px_-30px_rgba(26,23,20,.35)] transition duration-150 ${
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
        }`}
      >
        {/* Capped height; each column scrolls on its own so long lists never push the panel off-screen. */}
        <div className="wrap grid max-h-[calc(100dvh-8rem)] grid-cols-[260px_minmax(0,1fr)] py-10 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* Categories: countries and trip categories */}
          <div className="flex min-h-0 flex-col pr-8">
            <ul className="-mr-2 flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain pr-2">
              <li>{entryLink(all)}</li>
              {item.children.map((g) =>
                g.children.length === 0 ? null : (
                  <li key={g.id}>
                    {showGroupLabels && <p className="meta mb-1 text-[11px] text-ink-muted">{g.label}</p>}
                    <ul className="flex flex-col">
                      {g.children.map((e) => (
                        <li key={e.id}>{entryLink(e)}</li>
                      ))}
                    </ul>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Trips of the active category */}
          <div className="flex min-h-0 min-w-0 flex-col border-l border-line pl-10 xl:pl-14">
            <ul className="grid min-h-0 grid-cols-2 gap-x-10 gap-y-4 overflow-y-auto overscroll-contain">
              {entryTrips.slice(0, PANEL_TRIPS).map((t) => {
                const info = trips[tripSlug(t.url)!];
                return (
                  <li key={t.id}>
                    <Link href={t.url} className="group/trip flex items-center gap-4">
                      <span className="relative size-14 flex-none overflow-hidden bg-stone">
                        <Photo src={info?.image} alt="" sizes="56px" className="bg-night-raised" />
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-[16px] leading-snug group-hover/trip:text-highland-deep">{t.label}</span>
                        {(info?.meta || info?.price) && (
                          <span className="mt-0.5 block truncate text-[12px] text-ink-muted">
                            {[info.meta, info.price && `from ${info.price}`].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {entryTrips.length === 0 && <p className="text-[15px] text-ink-muted">No trips listed yet.</p>}

            <Link
              href={entry.url || "#"}
              className="mt-8 flex flex-none items-center gap-2 self-start text-[17px] font-semibold underline decoration-2 underline-offset-[6px] hover:text-highland-deep"
            >
              {entry === all ? "Explore all trips" : `Explore more ${entry.label} trips`}
              <ArrowRightIcon strokeWidth={1.8} size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile drill-down: the group (Countries / Categories) is only a small
// toggle; the rows are the places themselves, each opening onto its trips.
// Phone menu: every trip in one list, open by default (no tabs, no place pills).
export function MobileMegaMenu({ item, trips }: { item: NavItem; trips: Record<string, MenuTrip> }) {
  const all = tripsUnder(item);
  return (
    <details open className="group border-b border-white/15">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-xl font-semibold uppercase [&::-webkit-details-marker]:hidden">
        {item.label}
        <ChevronDownIcon size={20} strokeWidth={1.8} className="transition group-open:rotate-180" />
      </summary>

      <div className="pb-6">
        <ul className="flex flex-col gap-4">
          {all.map((t) => {
            const info = trips[tripSlug(t.url)!];
            return (
              <li key={t.id}>
                <Link href={t.url} className="flex items-center gap-3">
                  <span className="relative size-14 flex-none overflow-hidden bg-night-raised">
                    <Photo src={info?.image} alt="" sizes="56px" className="bg-night-raised" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] leading-snug">{t.label}</span>
                    {(info?.meta || info?.price) && (
                      <span className="mt-0.5 block truncate text-[12px] text-night-muted">
                        {[info.meta, info.price && `from ${info.price}`].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href={item.url || "#"} className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-[14px] font-medium text-highland">
          All trips <ArrowRightIcon strokeWidth={1.6} size={14} />
        </Link>
      </div>
    </details>
  );
}
