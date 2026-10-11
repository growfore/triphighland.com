import Link from "next/link";
import { getFooterNav, getSiteConfig } from "@/lib/site";
import { imageUrl, whatsappLink } from "@/lib/media";
import { getLabels } from "@/lib/labels";
import NewsletterForm from "./newsletter-form";
import BenefitsBand from "./benefits-band";
import Photo from "./photo";

export default async function Footer() {
  const [config, groups] = await Promise.all([getSiteConfig(), getFooterNav()]);
  const whatsapp = whatsappLink(config.whatsAppNumber);
  const labels = getLabels(config.content);
  const host = config.url ? config.url.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";

  return (
    <>
    {/* Homepage → Benefits, shown above the footer on every page. */}
    <BenefitsBand />
    <footer className="bg-soot text-paper">
      <div className="wrap pb-10 pt-16 lg:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-12">
          {/* Public profile: logo + description (name as text when there is no logo). */}
          <div className="max-w-[460px]">
            {config.logo ? (
              // Tenant logos are often SVG; next/image adds nothing for them.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl(config.logo)} alt={config.name} className="h-12 w-auto max-w-[220px] object-contain" />
            ) : (
              <p className="text-2xl font-semibold uppercase tracking-[0.02em]">{config.name}</p>
            )}
            {config.description && <p className="mt-5 text-[15px] font-light leading-relaxed text-soot-muted">{config.description}</p>}
          </div>
          <NewsletterForm labels={labels.newsletter} heading={labels.newsletter.title || labels.newsletter.description} />
        </div>

        {/* Associations: logos sit on light chips so full-colour marks stay legible on soot. */}
        {config.associations?.items?.length ? (
          <div className="mt-16 flex flex-wrap items-center justify-between gap-x-12 gap-y-6 border-t border-paper/20 pt-8 lg:mt-20">
            {config.associations.title && <span className="text-[12px] font-medium text-soot-muted">{config.associations.title}</span>}
            <div className="flex flex-wrap items-center gap-3">
              {config.associations.items.map((a, i) => (
                <span key={a.image || i} className="relative h-14 w-28 rounded-[4px] bg-paper" title={a.title}>
                  <span className="absolute inset-2">
                    <Photo src={a.image} alt={a.title} sizes="112px" className="!object-contain" />
                  </span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10 border-t border-paper/20 pt-8 text-[14px] lg:mt-20">
          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-2.5">
              <span className="text-[12px] font-medium text-soot-muted">{group.label}</span>
              {group.children.map((link) => (
                <Link key={link.id} href={link.url || "#"} className="hover:text-highland">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] font-medium text-soot-muted">{labels.footer.linksHeading}</span>
            {config.phoneNumbers.map((p) => (
              <a key={p.label + p.number} href={`tel:${p.number}`} className="hover:text-highland">
                {p.number} <span className="text-soot-muted">· {p.label}</span>
              </a>
            ))}
            {config.email && (
              <a href={`mailto:${config.email}`} className="break-all hover:text-highland">
                {config.email}
              </a>
            )}
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-highland">
                WhatsApp
              </a>
            )}
            {Object.entries(config.socials).map(([network, url]) =>
              url ? (
                <a key={network} href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-highland">
                  {network}
                </a>
              ) : null,
            )}
            {config.fullAddress && <span className="text-soot-muted">{config.fullAddress}</span>}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-4 text-[12px] text-soot-muted">
          <span>
            {labels.footer.copyright || `© ${new Date().getFullYear()} ${config.name}${host ? ` · ${host}` : ""}`}
          </span>
          <span className="flex gap-6">
            {config.documents.some((d) => d.published) && (
              <Link href="/legal-documents" className="hover:text-paper">
                {config.content.pageHeaders?.documents?.title || "Documents"}
              </Link>
            )}
            <Link href="/contact" className="hover:text-paper">
              Contact
            </Link>
          </span>
        </div>
      </div>
    </footer>
    </>
  );
}
