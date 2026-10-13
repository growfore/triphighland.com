import { imageUrl } from "@/lib/media";

const ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/gi, (match, entity: string) => {
    if (entity[0] !== "#") return ENTITIES[entity.toLowerCase()] ?? match;
    const hex = entity[1]?.toLowerCase() === "x";
    const codePoint = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
  });
}

const ALLOWED_TAGS = new Set([
  "a", "b", "blockquote", "br", "code", "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6",
  "hr", "i", "img", "li", "ol", "p", "pre", "s", "small", "strong", "sub", "sup",
  "table", "tbody", "td", "th", "thead", "tr", "u", "ul",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title"]),
  img: new Set(["src", "alt", "title"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
};

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? trimmed : "";
  } catch {
    return "";
  }
}

function sanitizeHtml(html: string): string {
  // The leading (\/?) capture distinguishes </a> from <a>. Without it every
  // closing tag was re-emitted as an opening tag — "</li>" became "<li>" — so
  // sanitised markup came out with nothing closed. Browsers auto-close p/li/
  // strong, which hid it; an unclosed <a> does not auto-close usefully and
  // swallowed the rest of the paragraph.
  return html.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z][a-zA-Z0-9:-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/gi, (_match, closing: string, tag: string, attrString: string) => {
    const lowerTag = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(lowerTag)) return "";
    if (closing) return `</${lowerTag}>`;
    const allowed = ALLOWED_ATTRS[lowerTag];
    if (!allowed) return `<${lowerTag}>`;
    const attrs = attrString.replace(/([a-zA-Z][a-zA-Z0-9:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi, (_m, name: string, dq?: string, sq?: string, bare?: string) => {
      const lowerName = name.toLowerCase();
      if (!allowed.has(lowerName)) return "";
      const value = dq ?? sq ?? bare ?? "";
      if (lowerName === "href" || lowerName === "src") {
        const safe = sanitizeUrl(value);
        if (!safe) return "";
        // CMS media is stored as "/uploads/..." on the API host, not this site.
        const url = lowerName === "src" && safe.startsWith("/") && !safe.startsWith("//") ? imageUrl(safe) : safe;
        return ` ${lowerName}="${url.replace(/"/g, "&quot;")}"`;
      }
      return ` ${lowerName}="${value.replace(/"/g, "&quot;")}"`;
    });
    if (lowerTag !== "img") return `<${lowerTag}${attrs}>`;
    // An image the editor left without alt text is treated as decorative, so
    // screen readers skip it instead of announcing the file URL.
    const alt = / alt="/.test(attrs) ? "" : ' alt=""';
    return `<img${attrs}${alt} loading="lazy" decoding="async">`;
  }).replace(/<script[\s\S]*?<\/script>/gi, "").replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

// Content is staff-authored HTML. Decode editor-escaped markup, remove stale
// package shortcodes, and sanitize to prevent XSS.
export function richContent(html: string | null | undefined): string {
  if (!html) return "";
  let value = html.replace(/\["packages".*?\]/g, "");
  for (let pass = 0; pass < 3; pass += 1) {
    const decoded = decodeEntities(value);
    if (decoded === value) break;
    value = decoded;
  }
  // Tables scroll inside a wrapper on narrow screens, so the table itself can
  // span the full width.
  return sanitizeHtml(value)
    .replace(/<table>/g, '<div class="rich-table"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

export function plainContent(html: string | null | undefined): string {
  return richContent(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function richListItems(items: string[] | null | undefined): string[] {
  return (items ?? []).flatMap((item) => {
    const html = richContent(item);
    const listItems = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => match[1]);
    return (listItems.length ? listItems : html.split(/\s*(?:-->|<br\s*\/?>|\r?\n)\s*/gi))
      .filter((value) => plainContent(value));
  });
}
