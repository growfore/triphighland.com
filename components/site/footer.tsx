import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { getCategories, getFooterNav, getInfoPages, getSiteConfig, type NavItem } from "@/lib/site";
import { imageUrl, whatsappLink } from "@/lib/media";
import { getLabels } from "@/lib/labels";
import { getIntegrations } from "@/lib/integrations";
import NewsletterForm from "./newsletter-form";
import BenefitsBand from "./benefits-band";
import Photo from "./photo";
import { WhatsAppIcon } from "./icons";

const TOP_CATEGORIES = 5;

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="meta mb-1 text-[12px] font-normal text-soot-muted">{title}</h2>
      {children}
    </div>
  );
}

const linkClass = "w-fit text-[15px] hover:text-highland";

export default async function Footer() {
  const [config, groups, infoPages, categories] = await Promise.all([
    getSiteConfig(),
    getFooterNav(),
    getInfoPages(),
    getCategories(),
  ]);
  const whatsapp = whatsappLink(config.whatsAppNumber);
  const labels = getLabels(config.content);
  const host = config.url ? config.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";
  const socials = Object.entries(config.socials).filter(([, url]) => Boolean(url));
  const hasDocuments = config.documents.some((d) => d.published);

  // Dashboard footer menu wins; with none saved, fall back to Explore and
  // Company columns built from the tenant's own categories and pages.
  const columns: { id: string; label: string; links: Pick<NavItem, "id" | "label" | "url">[] }[] = groups.length
    ? groups.map((g) => ({ id: g.id, label: g.label, links: g.children }))
    : [
        {
          id: "explore",
          label: config.content.pageHeaders?.explore?.title || "Explore",
          links: [
            { id: "all", label: "All trips", url: "/explore" },
            ...categories
              .filter((c) => c.categoryHandle !== "default")
              .slice(0, TOP_CATEGORIES)
              .map((c) => ({ id: `cat-${c.id}`, label: c.categoryName, url: `/explore?category=${encodeURIComponent(c.categoryHandle)}` })),
            { id: "custom", label: "Customize your trip", url: "/design-your-trip" },
          ],
        },
        {
          id: "company",
          label: "Company",
          links: [
            ...infoPages.map((p) => ({ id: `page-${p.id}`, label: p.title, url: `/${p.slug}` })),
            { id: "team", label: "Our team", url: "/our-team" },
            { id: "blog", label: config.content.pageHeaders?.blog?.title || "Journal", url: "/blog" },
            ...(hasDocuments ? [{ id: "docs", label: config.content.pageHeaders?.documents?.title || "Documents", url: "/legal-documents" }] : []),
          ],
        },
      ];

  return (
    <>
      {/* Homepage → Benefits, shown above the footer on every page. */}
      <BenefitsBand />
      <footer className="bg-soot text-paper">
        {/* Newsletter band */}
        <div className="border-b border-paper/15">
          <div className="wrap flex flex-wrap items-end justify-between gap-x-16 gap-y-8 py-12 lg:py-16">
            <div className="max-w-[520px]">
              <p className="h-sub">{labels.newsletter.title || "Stories from the trail"}</p>
              <p className="mt-3 text-[15px] font-light text-soot-muted">
                {labels.newsletter.description || "New trips, seasonal departures and travel notes, a few times a year."}
              </p>
            </div>
            <NewsletterForm labels={labels.newsletter} />
          </div>
        </div>

        <div className="wrap pb-10 pt-14 lg:pt-20">
          <div className="grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1 lg:pr-8">
              <Link href="/" aria-label={config.name} className="inline-block">
                {config.logo ? (
                  // Tenant logos are often SVG; next/image adds nothing for them.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl(config.logo)} alt={config.name} className="h-12 w-auto max-w-[220px] object-contain brightness-0 invert" />
                ) : (
                  <span className="display text-2xl">{config.name}</span>
                )}
              </Link>
              {config.description && (
                <p className="mt-5 max-w-[420px] text-[15px] font-light leading-relaxed text-soot-muted">{config.description}</p>
              )}
              {socials.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {socials.map(([network, url]) => (
                    <li key={network}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex border border-paper/25 px-3 py-1.5 text-[13px] capitalize hover:border-paper"
                      >
                        {network}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {columns
              .filter((c) => c.links.length)
              .map((c) => (
                <Column key={c.id} title={c.label}>
                  {c.links.map((l) => (
                    <Link key={l.id} href={l.url || "#"} className={linkClass}>
                      {l.label}
                    </Link>
                  ))}
                </Column>
              ))}

            {/* Contact */}
            <Column title={labels.footer.linksHeading}>
              {config.phoneNumbers.map((p) => (
                <a key={p.label + p.number} href={`tel:${p.number.replace(/\s+/g, "")}`} className={`${linkClass} flex items-start gap-2.5`}>
                  <PhoneIcon size={16} strokeWidth={1.8} className="mt-1 flex-none text-soot-muted" />
                  <span>
                    {p.number}
                    {p.label.trim() && <span className="text-soot-muted"> · {p.label}</span>}
                  </span>
                </a>
              ))}
              {config.email && (
                <a href={`mailto:${config.email}`} className={`${linkClass} flex items-start gap-2.5 break-all`}>
                  <MailIcon size={16} strokeWidth={1.8} className="mt-1 flex-none text-soot-muted" />
                  {config.email}
                </a>
              )}
              {whatsapp && (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${linkClass} flex items-start gap-2.5`}>
                  <WhatsAppIcon size={16} className="mt-1 flex-none text-soot-muted" />
                  WhatsApp
                </a>
              )}
              {config.fullAddress && (
                <p className="flex items-start gap-2.5 text-[15px] text-soot-muted">
                  <MapPinIcon size={16} strokeWidth={1.8} className="mt-1 flex-none" />
                  {config.fullAddress}
                </p>
              )}
              {config.openHours && (
                <p className="flex items-start gap-2.5 text-[15px] text-soot-muted">
                  <ClockIcon size={16} strokeWidth={1.8} className="mt-1 flex-none" />
                  {config.openHours}
                </p>
              )}
              <Link href="/contact" className="mt-1 inline-flex w-fit items-center gap-2 text-[14px] font-medium text-highland hover:underline">
                Contact us <ArrowRightIcon size={14} strokeWidth={1.8} />
              </Link>
            </Column>
          </div>

          {/* Associations: logos sit on light chips so full-colour marks stay legible on soot. */}
          {config.associations?.items?.length ? (
            <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-paper/15 pt-8 lg:mt-16">
              {config.associations.title && <span className="meta text-[12px] text-soot-muted">{config.associations.title}</span>}
              <div className="flex flex-wrap items-center gap-3">
                {config.associations.items.map((a, i) => (
                  <span key={a.image || i} className="relative h-14 w-28 bg-paper" title={a.title}>
                    <span className="absolute inset-2">
                      <Photo src={a.image} alt={a.title} sizes="112px" className="!object-contain" />
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-paper/15 pt-6 text-[13px] text-soot-muted">
            <span>{labels.footer.copyright || `© ${new Date().getFullYear()} ${config.name}${host ? ` · ${host}` : ""}`}</span>
            <span className="flex flex-wrap gap-x-6 gap-y-2">
              <span>
                Powered by{" "}
                <a href="https://tripeleven.com" target="_blank" rel="noopener noreferrer" className="text-paper hover:text-highland">
                  Tripeleven
                </a>
              </span>
              {getIntegrations(config).askConsent && (
                <button type="button" data-cookie-settings className="hover:text-paper">
                  Cookie settings
                </button>
              )}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
