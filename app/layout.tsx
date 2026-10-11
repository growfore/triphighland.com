import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { interTight, montserrat, plexMono } from "@/lib/font";
import { getSiteConfig, getTrips } from "@/lib/site";
import { getLabels } from "@/lib/labels";
import { imageUrl, whatsappLink } from "@/lib/media";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import EnquirySheet from "@/components/site/enquiry-sheet";
import { WhatsAppIcon } from "@/components/site/icons";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    metadataBase: config.url ? new URL(config.url) : undefined,
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
  const ga = config.integrations.ga?.enabled ? config.integrations.ga.id : undefined;
  const gtm = config.integrations.gtm?.enabled ? config.integrations.gtm.id : undefined;
  const whatsapp = whatsappLink(config.whatsAppNumber);

  return (
    <html lang="en" className={`${interTight.variable} ${montserrat.variable} ${plexMono.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
        <EnquirySheet
          trips={trips.map((t) => t.title)}
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
            className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,.45)] transition hover:bg-[#1ebe5b]"
          >
            <WhatsAppIcon size={28} />
          </a>
        )}

        {ga && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        )}
        {gtm && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
        )}
      </body>
    </html>
  );
}
