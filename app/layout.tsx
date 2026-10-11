import type { Metadata, Viewport } from "next";
import "./globals.css";
import { interTight, montserrat, plexMono } from "@/lib/font";
import { getSiteConfig, getTrips } from "@/lib/site";
import { getLabels } from "@/lib/labels";
import { imageUrl, whatsappLink } from "@/lib/media";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import EnquirySheet from "@/components/site/enquiry-sheet";
import Integrations from "@/components/site/integrations";
import { getIntegrations } from "@/lib/integrations";
import JsonLd from "@/components/site/json-ld";
import { organizationLd, siteUrl } from "@/lib/seo";
import { WhatsAppIcon } from "@/components/site/icons";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    metadataBase: new URL(siteUrl(config)),
    title: { default: config.name, template: `%s · ${config.name}` },
    description: config.description,
    openGraph: {
      siteName: config.name,
      images: config.image ? [{ url: imageUrl(config.image) }] : undefined,
    },
    icons: config.logo ? { icon: imageUrl(config.logo) } : undefined,
  };
}

export const viewport: Viewport = { themeColor: "#15283a" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [config, { trips }] = await Promise.all([getSiteConfig(), getTrips({ limit: 50 })]);
  const booking = config.content.pageHeaders?.booking;
  const tripLabels = getLabels(config.content).trip;
  const { trackers, tawk } = getIntegrations(config);
  const whatsapp = whatsappLink(config.whatsAppNumber);

  return (
    <html lang="en" className={`${interTight.variable} ${montserrat.variable} ${plexMono.variable}`}>
      <body>
        <JsonLd data={organizationLd(config)} />
        <Header />
        {children}
        <Footer />
        <EnquirySheet
          trips={trips.map((t) => t.title)}
          tripSlugs={Object.fromEntries(trips.map((t) => [t.title, t.slug]))}
          currency={config.content.tripCard?.currency || "$"}
          whatsAppNumber={config.whatsAppNumber}
          heading={{ eyebrow: booking?.eyebrow, title: booking?.title || tripLabels.talkToExpert, subtitle: booking?.subtitle }}
          labels={tripLabels}
        />

        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with a guide on WhatsApp"
            // Bottom-left, clear of Tawk.to's launcher on the right.
            className="fixed bottom-5 left-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,.45)] transition hover:bg-[#1ebe5b]"
          >
            <WhatsAppIcon size={28} />
          </a>
        )}

        <Integrations
          trackers={trackers}
          tawk={tawk}
          consentRequired={config.consent.enabled}
          policyHref={config.documents.some((d) => d.published) ? "/legal-documents" : undefined}
        />
      </body>
    </html>
  );
}
