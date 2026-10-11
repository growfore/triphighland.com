"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice, imageUrl } from "@/lib/media";
import { ArrowRightIcon, SearchIcon, XIcon } from "lucide-react";

type Result = { kind: "trip" | "blog"; href: string; title: string; meta: string; image?: string };

type Labels = { placeholder: string; button: string; trips: string; blogs: string; empty: string; currency: string };

function firstImage(images: unknown): string | undefined {
  if (Array.isArray(images)) return images[0];
  if (typeof images === "string") {
    try {
      return JSON.parse(images)[0];
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// Site search in a modal dialog: live trip + blog results from the TripEleven
// API (via the same-origin proxy), arrow keys to move, Enter to open.
// Submitting with nothing selected goes to /explore?search=…
export default function SearchDialog({ onClose, labels }: { onClose: () => void; labels: Labels }) {
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    input.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const qs = encodeURIComponent(q);
        const [trips, blogs] = await Promise.all([
          fetch(`/api/activity?search=${qs}&page=1&limit=6`, { signal: controller.signal }).then((r) => (r.ok ? r.json() : null)),
          fetch(`/api/blogs/published?search=${qs}&page=1&limit=4`, { signal: controller.signal }).then((r) => (r.ok ? r.json() : null)),
        ]);
        const tripResults: Result[] = (trips?.data ?? []).map(
          (t: { slug: string; title: string; duration?: string; price?: number | null; images?: unknown }) => ({
            kind: "trip",
            href: `/trip/${t.slug}`,
            title: t.title,
            meta: [t.duration, t.price != null ? formatPrice(t.price, labels.currency) : ""].filter(Boolean).join(" · "),
            image: firstImage(t.images),
          }),
        );
        const blogResults: Result[] = (blogs?.blogs ?? []).map(
          (b: { slug: string; title: string; coverImage?: string; category?: { categoryName?: string } }) => ({
            kind: "blog",
            href: `/blog/${b.slug}`,
            title: b.title,
            meta: b.category?.categoryName?.trim() ?? "",
            image: b.coverImage,
          }),
        );
        setResults([...tripResults, ...blogResults]);
        setActive(-1);
      } catch {
        /* aborted by a newer keystroke */
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, labels.currency]);

  const shown = query.trim().length >= 2 ? (results ?? []) : [];

  function close() {
    ref.current?.close();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!shown.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % shown.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? shown.length - 1 : i - 1));
    }
  }

  function go(href: string) {
    router.push(href);
    close();
  }

  const exploreHref = `/explore?search=${encodeURIComponent(query.trim())}`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    go(shown[active]?.href ?? exploreHref);
  }

  const groups = (["trip", "blog"] as const)
    .map((kind) => ({ kind, items: shown.map((r, i) => ({ r, i })).filter(({ r }) => r.kind === kind) }))
    .filter((g) => g.items.length);

  return (
    <dialog
      ref={ref}
      aria-label={labels.button}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      className="mx-auto mt-[10vh] max-h-[80vh] w-[min(680px,calc(100vw-32px))] overflow-hidden rounded-[8px] bg-white p-0 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,.5)] backdrop:bg-black/50"
    >
      <form onSubmit={onSubmit} role="search" className="flex items-center gap-3 border-b border-line-soft px-5 py-3">
        <SearchIcon strokeWidth={1.8} size={20} className="flex-none text-ink-muted" />
        <label htmlFor="site-search" className="sr-only">
          {labels.button}
        </label>
        <input
          ref={input}
          id="site-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={labels.placeholder}
          role="combobox"
          aria-expanded={shown.length > 0}
          aria-controls="site-search-results"
          aria-activedescendant={active >= 0 ? `search-result-${active}` : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-lg outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="button" onClick={close} aria-label="Close" className="flex size-10 flex-none items-center justify-center hover:bg-stone">
          <XIcon strokeWidth={1.8} size={18} />
        </button>
      </form>

      <div id="site-search-results" role="listbox" className="max-h-[calc(80vh-70px)] overflow-y-auto">
        {loading && !shown.length && <p className="px-6 py-8 text-sm text-ink-muted">…</p>}
        {!loading && query.trim().length >= 2 && results && !shown.length && (
          <p className="px-6 py-8 text-sm text-ink-muted">{labels.empty}</p>
        )}
        {groups.map((g) => (
          <div key={g.kind} className="py-2">
            <p className="meta px-6 pb-1 pt-3 text-[11px] text-ink-muted">{g.kind === "trip" ? labels.trips : labels.blogs}</p>
            <ul>
              {g.items.map(({ r, i }) => (
                <li key={r.href} id={`search-result-${i}`} role="option" aria-selected={active === i}>
                  <Link
                    href={r.href}
                    onClick={close}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-4 px-6 py-2.5 ${active === i ? "bg-stone" : ""}`}
                  >
                    <span className="relative size-12 flex-none overflow-hidden rounded-[4px] bg-stone">
                      {r.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl(r.image)} alt="" className="size-full object-cover" loading="lazy" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.title}</span>
                      {r.meta && <span className="meta block truncate text-[11px] text-ink-muted">{r.meta}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {shown.length > 0 && (
          <div className="border-t border-line-soft px-6 py-3">
            <button type="button" onClick={() => go(exploreHref)} className="inline-flex items-center gap-1.5 text-sm font-medium text-highland-deep hover:underline">
              {labels.button}: “{query.trim()}” <ArrowRightIcon size={14} strokeWidth={1.8} />
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
