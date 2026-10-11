"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { NavItem } from "@/lib/site";
import Photo from "./photo";
import { ArrowRightIcon, ChevronDownIcon, SearchIcon } from "lucide-react";

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

const placesUnder = (entry: NavItem) => entry.children.filter((c) => !tripSlug(c.url));

// The auto menu nests Discover → group → place/category → city → trip; the
// plain dropdown only has room for two of those levels.
export function isMega(item: NavItem) {
  return item.children.some((g) => g.children.some((e) => e.children.length > 0));
}

const CARDS = 3;
// Past these counts a list gets a filter box / the chips collapse into "+N".
const FILTER_AT = 10;
const MAX_PLACES = 8;
const MOBILE_TRIPS = 6;

const tripCount = (n: number) => `${n} ${n === 1 ? "trip" : "trips"}`;

function PlaceChips({ entry, dark }: { entry: NavItem; dark?: boolean }) {
  const places = placesUnder(entry);
  if (!places.length) return null;
  const chip = dark
    ? "border border-white/30 px-3 py-1 text-[13px] hover:border-white"
    : "border border-line px-3 py-1 text-[13px] hover:border-highland-deep hover:text-highland-deep";
  return (
    <div className="flex flex-wrap gap-2">
      {places.slice(0, MAX_PLACES).map((p) => (
        <Link key={p.id} href={p.url || "#"} className={chip}>
          {p.label}
        </Link>
      ))}
      {places.length > MAX_PLACES && (
        <Link href={entry.url || "#"} className={`${chip} opacity-70`}>
          +{places.length - MAX_PLACES} more
        </Link>
      )}
    </div>
  );
}

export default function MegaMenu({ item, trips }: { item: NavItem; trips: Record<string, MenuTrip> }) {
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState(item.children[0]?.id);
  const [entryByGroup, setEntryByGroup] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const triggerRef = useRef<HTMLAnchorElement>(null);

  const group = item.children.find((g) => g.id === groupId) ?? item.children[0];
  const q = query.trim().toLowerCase();
  const entries = (group?.children ?? []).filter((e) => !q || e.label.toLowerCase().includes(q));
  const entry = entries.find((e) => e.id === entryByGroup[group.id]) ?? entries[0];
  const entryTrips = entry ? tripsUnder(entry) : [];

  const pickGroup = (id: string) => {
    if (id === group?.id) return;
    setGroupId(id);
    setQuery("");
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
        {/* Fixed height; each column scrolls on its own so long lists never push the panel off-screen. */}
        <div className="wrap grid h-[min(440px,calc(100dvh-8rem))] grid-cols-[180px_220px_minmax(0,1fr)] py-8 xl:grid-cols-[200px_260px_minmax(0,1fr)]">
          {/* Groups: Countries / Categories */}
          <div className="flex min-h-0 flex-col pr-6">
            <ul className="-mr-2 flex min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain pr-2">
              {item.children.map((g) => {
                const active = g.id === group?.id;
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onPointerEnter={() => pickGroup(g.id)}
                      onFocus={() => pickGroup(g.id)}
                      onClick={() => pickGroup(g.id)}
                      aria-pressed={active}
                      className={`meta flex w-full items-center justify-between border-l-2 py-2 pl-3 text-left text-[12px] ${
                        active ? "border-highland-deep text-highland-deep" : "border-transparent text-ink-muted hover:text-ink"
                      }`}
                    >
                      {g.label}
                      <span className="font-sans text-[12px] tracking-normal opacity-60">{g.children.length}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Link
              href={item.url || "#"}
              className="mt-auto flex flex-none items-center gap-2 pl-3 pt-4 text-[14px] font-medium text-highland-deep hover:underline"
            >
              All trips <ArrowRightIcon strokeWidth={1.6} size={14} />
            </Link>
          </div>

          {/* Entries of the active group: Nepal, Trekking, ... */}
          <div className="flex min-h-0 flex-col border-l border-line-soft px-6">
            {(group?.children.length ?? 0) > FILTER_AT && (
              <label className="mb-3 flex flex-none items-center gap-2 border-b border-line px-3 pb-2 text-ink-muted focus-within:border-highland-deep">
                <SearchIcon strokeWidth={1.8} size={14} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Filter ${group.label.toLowerCase()}`}
                  aria-label={`Filter ${group.label}`}
                  className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-muted"
                />
              </label>
            )}
            <ul className="-mr-3 flex min-h-0 flex-col gap-0.5 overflow-y-auto overscroll-contain pr-3">
              {entries.map((e) => {
                const active = e.id === entry?.id;
                const count = tripsUnder(e).length;
                return (
                  <li key={e.id}>
                    <Link
                      href={e.url || "#"}
                      onPointerEnter={() => setEntryByGroup((m) => ({ ...m, [group.id]: e.id }))}
                      onFocus={() => setEntryByGroup((m) => ({ ...m, [group.id]: e.id }))}
                      className={`flex items-baseline justify-between gap-3 rounded-[4px] px-3 py-2.5 text-[15px] ${
                        active ? "bg-stone font-medium" : "hover:bg-stone/60"
                      }`}
                    >
                      <span className="min-w-0 truncate">{e.label}</span>
                      {count > 0 && <span className="flex-none text-[12px] text-ink-muted">{tripCount(count)}</span>}
                    </Link>
                  </li>
                );
              })}
              {entries.length === 0 && <li className="px-3 py-2.5 text-[14px] text-ink-muted">No matches</li>}
            </ul>
          </div>

          {/* Preview of the active entry: places and trip cards */}
          {entry && (
            <div className="min-h-0 min-w-0 overflow-y-auto overscroll-contain border-l border-line-soft pl-8">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="display text-[20px] leading-tight">{entry.label}</h2>
                <Link href={entry.url || "#"} className="flex items-center gap-2 text-[14px] font-medium text-highland-deep hover:underline">
                  View all {entryTrips.length > 0 && entryTrips.length} <ArrowRightIcon strokeWidth={1.6} size={14} />
                </Link>
              </div>

              <div className="mt-4">
                <PlaceChips entry={entry} />
              </div>

              <ul className="mt-6 grid grid-cols-3 gap-5">
                {entryTrips.slice(0, CARDS).map((t) => {
                  const info = trips[tripSlug(t.url)!];
                  return (
                    <li key={t.id}>
                      <Link href={t.url} className="ht-card group/trip flex flex-col">
                        <span className="relative block aspect-[4/3] overflow-hidden bg-stone">
                          <Photo src={info?.image} alt="" sizes="240px" />
                        </span>
                        {info?.meta && <span className="meta mt-3 text-[11px] text-ink-muted">{info.meta}</span>}
                        <span className="mt-1 text-[14px] font-medium leading-snug group-hover/trip:text-highland-deep">{t.label}</span>
                        {info?.price && <span className="mt-1 text-[13px] text-ink-muted">from {info.price}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {entryTrips.length === 0 && <p className="mt-6 text-[14px] text-ink-muted">No trips listed yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile drill-down: the group (Countries / Categories) is only a small
// toggle; the rows are the places themselves, each opening onto its trips.
export function MobileMegaMenu({ item, trips }: { item: NavItem; trips: Record<string, MenuTrip> }) {
  const [groupId, setGroupId] = useState(item.children[0]?.id);
  const group = item.children.find((g) => g.id === groupId) ?? item.children[0];

  return (
    <details className="group border-b border-white/15">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-xl font-semibold uppercase [&::-webkit-details-marker]:hidden">
        {item.label}
        <ChevronDownIcon size={20} strokeWidth={1.8} className="transition group-open:rotate-180" />
      </summary>

      <div className="pb-6">
        {item.children.length > 1 && (
          <div role="tablist" className="mb-4 flex gap-1 bg-white/10 p-1">
            {item.children.map((g) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={g.id === group?.id}
                onClick={() => setGroupId(g.id)}
                className={`flex-1 px-3 py-2 text-[13px] font-medium ${
                  g.id === group?.id ? "bg-paper text-night" : "text-night-muted"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        <ul role="tabpanel" className="flex flex-col">
          {group?.children.map((entry) => {
            const entryTrips = tripsUnder(entry);
            return (
              <li key={entry.id} className="border-t border-white/10 first:border-t-0">
                <details className="group/entry">
                  <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 text-base [&::-webkit-details-marker]:hidden">
                    <span className="flex-1 font-medium">{entry.label}</span>
                    {entryTrips.length > 0 && <span className="text-[13px] text-night-muted">{tripCount(entryTrips.length)}</span>}
                    <ChevronDownIcon strokeWidth={1.8} size={18} className="transition group-open/entry:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-4 pb-5">
                    <PlaceChips entry={entry} dark />
                    <ul className="flex flex-col gap-3">
                      {entryTrips.slice(0, MOBILE_TRIPS).map((t) => {
                        const info = trips[tripSlug(t.url)!];
                        return (
                          <li key={t.id}>
                            <Link href={t.url} className="flex items-center gap-3">
                              <span className="relative size-14 flex-none overflow-hidden rounded-[4px] bg-night-raised">
                                <Photo src={info?.image} alt="" sizes="56px" />
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
                    <Link href={entry.url || "#"} className="flex items-center gap-2 text-[14px] font-medium text-highland">
                      View all {entry.label} <ArrowRightIcon strokeWidth={1.6} size={14} />
                    </Link>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>

        <Link href={item.url || "#"} className="mt-2 flex items-center gap-2 border-t border-white/10 pt-4 text-[14px] text-night-muted underline underline-offset-4">
          All trips <ArrowRightIcon strokeWidth={1.6} size={14} />
        </Link>
      </div>
    </details>
  );
}
