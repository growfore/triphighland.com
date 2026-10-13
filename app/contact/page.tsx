import type { Metadata } from "next";
import { getSiteConfig, getTrips } from "@/lib/site";
import { whatsappLink } from "@/lib/media";
import { getLabels } from "@/lib/labels";
import PageHeader, { PageFooterContent } from "@/components/site/page-header";
import EnquiryForm from "@/components/site/enquiry-form";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const h = (await getSiteConfig()).content.pageHeaders?.contact;
  return { title: h?.metaTitle || "Contact", description: h?.metaDescription || undefined, alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const [config, { trips }] = await Promise.all([getSiteConfig(), getTrips({ limit: 50 })]);
  const header = config.content.pageHeaders?.contact;
  const labels = getLabels(config.content);
  const whatsapp = whatsappLink(config.whatsAppNumber);

  const channels = [
    ...config.phoneNumbers.map((p) => ({ label: p.label || "Phone", value: p.number, href: `tel:${p.number}` })),
    ...(config.email ? [{ label: "Email", value: config.email, href: `mailto:${config.email}` }] : []),
    ...(whatsapp ? [{ label: "WhatsApp", value: `+${config.whatsAppNumber}`, href: whatsapp }] : []),
    ...(config.fullAddress ? [{ label: "Office", value: config.fullAddress, href: "" }] : []),
    ...(config.openHours ? [{ label: "Hours", value: config.openHours, href: "" }] : []),
  ];

  return (
    <main>
      <PageHeader
        fields={header}
        title="Contact"
      />
      <section className="wrap flex flex-wrap gap-x-24 gap-y-14 py-12 lg:py-20">
        <dl className="min-w-0 flex-[1_1_360px]">
          {channels.map((c) => (
            <div key={c.label + c.value} className="border-t border-line py-6">
              <dt className="meta text-[12px] text-ink-muted">{c.label}</dt>
              <dd className="mt-2 text-lg font-medium sm:text-xl">
                {c.href ? (
                  <a href={c.href} className="break-words hover:text-highland-deep" {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {c.value}
                  </a>
                ) : (
                  c.value
                )}
              </dd>
            </div>
          ))}
          {Object.keys(config.socials).length > 0 && (
            <div className="flex flex-wrap gap-3 border-t border-line pt-6">
              {Object.entries(config.socials).map(([network, url]) =>
                url ? (
                  <a key={network} href={url} target="_blank" rel="noopener noreferrer" className="chip capitalize">
                    {network}
                  </a>
                ) : null,
              )}
            </div>
          )}
        </dl>
        <div className="min-w-0 flex-[1_1_520px] rounded-[4px] bg-night p-6 text-paper sm:p-12">
          <h2 className="display text-xl sm:text-2xl">{labels.trip.bookNow}</h2>
          <div className="mt-8">
            <EnquiryForm
              trips={trips.map((t) => t.title)}
              tripSlugs={Object.fromEntries(trips.map((t) => [t.title, t.slug]))}
              currency={config.content.tripCard?.currency || "$"}
              whatsapp={whatsapp}
              labels={labels.trip}
            />
          </div>
        </div>
      </section>
      <PageFooterContent fields={header} />
    </main>
  );
}
