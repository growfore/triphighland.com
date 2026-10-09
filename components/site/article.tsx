import Link from "next/link";
import type { ReactNode } from "react";
import { getSiteConfig, getTrips } from "@/lib/site";
import { getLabels } from "@/lib/labels";
import { richContent } from "@/lib/rich-content";
import TripCard from "./trip-card";
import Toc, { type TocItem } from "./toc";

// CMS rich text, with TripEleven's ["packages", {...}] shortcode expanded into
// a row of trip cards.
const SHORTCODE = /(?:<p>\s*)?(\["packages".*?\])(?:\s*<\/p>)?/g;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/&[a-z#0-9]+;/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

// The sanitiser drops id attributes, so anchors are (re)added here to h2/h3,
// collecting the table of contents on the way. `used` keeps ids unique
// across the article's html parts.
function withHeadingIds(html: string, used: Map<string, number>, toc: TocItem[]): string {
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim();
    if (!text) return _m;
    const base = slugify(text);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

export default async function Article({
  html,
  aside,
  toc: showToc = false,
}: {
  html: string;
  aside?: ReactNode;
  // Show a table of contents (from h2/h3) above the CTA in the sidebar.
  toc?: boolean;
}) {
  const parts: ({ type: "html"; html: string } | { type: "trips"; limit: number })[] = [];
  let last = 0;
  for (const m of html.matchAll(SHORTCODE)) {
    parts.push({ type: "html", html: html.slice(last, m.index) });
    try {
      const cfg = JSON.parse(m[1].replace(/&quot;/g, '"'))[1] ?? {};
      parts.push({ type: "trips", limit: Number(cfg.limit) || 3 });
    } catch {
      /* malformed shortcode: drop it */
    }
    last = (m.index ?? 0) + m[0].length;
  }
  parts.push({ type: "html", html: html.slice(last) });

  const needsTrips = parts.some((p) => p.type === "trips");
  const [config, trips] = await Promise.all([
    getSiteConfig(),
    needsTrips ? getTrips({ limit: 12 }).then((r) => r.trips) : Promise.resolve([]),
  ]);
  const labels = getLabels(config.content);

  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const rendered = parts.map((p) => (p.type === "html" ? { ...p, html: withHeadingIds(richContent(p.html), used, toc) } : p));
  const booking = config.content.pageHeaders?.booking;

  return (
    <div className="wrap grid gap-12 py-12 lg:grid-cols-[minmax(0,760px)_1fr] lg:gap-24 lg:py-20">
      <article className="min-w-0">
        {rendered.map((p, i) =>
          p.type === "html" ? (
            <div key={i} className="rich" dangerouslySetInnerHTML={{ __html: p.html }} />
          ) : (
            <div key={i} className="my-12 grid gap-10 sm:grid-cols-2">
              {trips.slice(0, p.limit).map((t) => (
                <TripCard key={t.id} trip={t} labels={labels.card} size="md" />
              ))}
            </div>
          ),
        )}
      </article>
      <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
        {aside}
        {showToc && toc.length > 1 && <Toc items={toc} />}
        {booking?.title || booking?.subtitle ? (
          <div className="rounded-[4px] bg-night p-8 text-paper">
            {booking.title && <p className="display text-xl">{booking.title}</p>}
            {booking.subtitle && <p className="mt-3 font-light text-night-muted">{booking.subtitle}</p>}
            <Link href="/booking" className="btn-primary mt-6">
              {labels.trip.bookNow}
            </Link>
          </div>
        ) : (
          <Link href="/booking" className="btn-primary w-full">
            {labels.trip.bookNow}
          </Link>
        )}
      </aside>
    </div>
  );
}
