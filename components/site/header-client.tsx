"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/site";
import { imageUrl } from "@/lib/media";
import SearchDialog from "./search-dialog";
import MegaMenu, { MobileMegaMenu, isMega, type MenuTrip } from "./mega-menu";
import { ChevronDownIcon, MenuIcon, SearchIcon, XIcon } from "lucide-react";
import { WhatsAppIcon } from "./icons";

export type HeaderLabels = {
  bookNow: string;
  menu: string;
  openMenu: string;
  search: { placeholder: string; button: string; trips: string; blogs: string; empty: string; currency: string };
};

type Props = {
  name: string;
  logo?: string;
  showName: boolean;
  items: NavItem[];
  trips: Record<string, MenuTrip>;
  whatsapp: string;
  labels: HeaderLabels;
};

function Brand({ name, logo, showName, className }: { name: string; logo?: string; showName: boolean; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className ?? ""}`} aria-label={name}>
      {logo && (
        // Tenant logos are often SVG; next/image adds nothing for them.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl(logo)} alt={showName ? "" : name} className="h-7 w-auto max-w-[140px] object-contain" />
      )}
      {(showName || !logo) && <span className="uppercase tracking-[0.02em]">{name}</span>}
    </Link>
  );
}

// White bar with ruled cells (the design's sub-page navbar), used site-wide.
export default function HeaderClient({ name, logo, showName, items, trips, whatsapp, labels }: Props) {
  const pathname = usePathname();
  // Remember which path the menu was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  // Floating search panel, same path-scoped trick so it closes on navigation.
  const [searchOn, setSearchOn] = useState<string | null>(null);
  const searchOpen = searchOn === pathname;
  const setSearchOpen = (value: boolean) => setSearchOn(value ? pathname : null);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white text-ink">
        <div className="flex h-14 items-stretch lg:h-16">
          <Brand
            name={name}
            logo={logo}
            showName={showName}
            className="px-4 text-[17px] font-semibold tracking-[-0.02em] sm:px-[clamp(20px,3vw,40px)] lg:border-r lg:border-line-soft lg:text-lg"
          />

          <nav
            aria-label="Primary"
            className="hidden flex-1 items-center gap-8 px-8 text-[13px] font-medium uppercase tracking-[0.04em] lg:flex"
          >
            {items.map((item) =>
              isMega(item) ? <MegaMenu key={item.id} item={item} trips={trips} /> : <NavEntry key={item.id} item={item} />,
            )}
          </nav>

          <div className="ml-auto hidden items-stretch lg:flex">
            <button
              type="button"
              data-search-toggle
              aria-label={labels.search.button}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(!searchOpen)}
              className={`flex w-16 items-center justify-center border-l border-line-soft hover:bg-paper`}
            >
              <SearchIcon size={20} strokeWidth={1.8} />
            </button>
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border-l border-line-soft px-6 text-[13px] font-medium uppercase tracking-[0.04em] hover:bg-paper"
              >
                <WhatsAppIcon size={18} />
                WhatsApp
              </a>
            )}
            <Link
              href="/design-your-trip"
              className="flex items-center bg-highland-deep px-6 text-[13px] font-medium uppercase tracking-[0.04em] text-white hover:bg-[#255a88]"
            >
              {labels.bookNow}
            </Link>
          </div>

          <button
            type="button"
            data-search-toggle
            aria-label={labels.search.button}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(!searchOpen)}
            className="ml-auto flex w-14 items-center justify-center border-l border-line-soft lg:hidden"
          >
            <SearchIcon strokeWidth={1.8} size={18} />
          </button>
          <button
            type="button"
            aria-label={labels.openMenu}
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="flex w-14 items-center justify-center border-l border-line-soft lg:hidden"
          >
            <MenuIcon size={20} strokeWidth={1.8} />
          </button>
        </div>

      </header>

      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} labels={labels.search} />}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-night text-paper"
        >
          <div className="flex items-center justify-between px-4 py-5">
            <Brand name={name} logo={logo} showName={showName} className="text-[23px] font-semibold tracking-[-0.02em]" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex size-11 items-center justify-center border border-white/40"
            >
              <XIcon size={20} strokeWidth={1.8} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col px-4 pb-10">
            {items.map((item) =>
              isMega(item) ? (
                <MobileMegaMenu key={item.id} item={item} trips={trips} />
              ) : (
                <MobileEntry key={item.id} item={item} />
              ),
            )}
            <div className="mt-auto flex flex-col gap-3 pt-10">
              <Link href="/design-your-trip" className="btn-primary">
                {labels.bookNow}
              </Link>
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
                  <WhatsAppIcon size={18} />
                  WhatsApp
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function NavEntry({ item }: { item: NavItem }) {
  if (!item.children.length) {
    return (
      <Link href={item.url || "#"} className="hover:opacity-75">
        {item.label}
      </Link>
    );
  }
  return <NavDropdown item={item} />;
}

// State-driven rather than :hover/:focus-within: after a client navigation the
// clicked link keeps focus and the pointer stays put, which kept a CSS-only
// panel open on the new page.
function NavDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const triggerRef = useRef<HTMLAnchorElement>(null);
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
      className="relative"
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
      onClick={(e) => {
        const link = (e.target as HTMLElement).closest("a");
        if (link) {
          setOpen(false);
          link.blur();
        }
      }}
    >
      <Link
        ref={triggerRef}
        href={item.url || "#"}
        className="flex items-center gap-1.5 py-2 hover:opacity-75"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {item.label}
        <ChevronDownIcon strokeWidth={1.8} size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </Link>
      <div
        className={`absolute left-0 top-full z-40 min-w-[280px] transition ${
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-1 opacity-0"
        }`}
      >
        <div className="flex gap-10 rounded-[4px] bg-white p-7 text-left normal-case tracking-normal text-ink shadow-[0_30px_60px_-30px_rgba(26,23,20,.45)]">
          {item.children.map((group) => (
            <div key={group.id} className="min-w-[180px]">
              <Link
                href={group.url || "#"}
                className="meta text-[12px] text-ink-muted hover:text-highland-deep"
              >
                {group.label}
              </Link>
              {group.children.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2 text-[14px] font-normal">
                  {group.children.map((leaf) => (
                    <li key={leaf.id}>
                      <Link href={leaf.url || "#"} className="hover:text-highland-deep">
                        {leaf.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileEntry({ item }: { item: NavItem }) {
  if (!item.children.length) {
    return (
      <Link href={item.url || "#"} className="border-b border-white/15 py-4 text-xl font-semibold uppercase">
        {item.label}
      </Link>
    );
  }
  return (
    <details className="group border-b border-white/15">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-xl font-semibold uppercase">
        {item.label}
        <ChevronDownIcon size={20} strokeWidth={1.8} className="transition group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-5 pb-6">
        <Link href={item.url || "#"} className="text-night-muted underline underline-offset-4">
          View all
        </Link>
        {item.children.map((group) => (
          <div key={group.id}>
            <Link href={group.url || "#"} className="meta text-[12px] text-night-muted">
              {group.label}
            </Link>
            <ul className="mt-2 flex flex-col gap-2 text-base">
              {group.children.map((leaf) => (
                <li key={leaf.id}>
                  <Link href={leaf.url || "#"}>{leaf.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
