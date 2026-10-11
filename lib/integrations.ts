import type { SiteConfig } from "@/lib/site";
import type { TawkIds, TrackerIds } from "@/components/site/integrations";

// Enabled integrations from /site-config, keeping only ids in their expected
// format: they are interpolated into inline scripts.
const PATTERNS = {
  ga: /^G-[A-Z0-9]{4,20}$/i,
  gtm: /^GTM-[A-Z0-9]{4,12}$/i,
  metaPixel: /^\d{6,20}$/,
  clarity: /^[a-z0-9]{6,20}$/i,
  tawk: /^[a-z0-9]{4,40}$/i,
};

function pick(entry: { enabled?: boolean; id?: string } | undefined, pattern: RegExp): string | undefined {
  const id = entry?.id?.trim();
  return entry?.enabled && id && pattern.test(id) ? id : undefined;
}

export function getIntegrations(config: SiteConfig): { trackers: TrackerIds; tawk?: TawkIds; askConsent: boolean } {
  const i = config.integrations;
  const trackers: TrackerIds = {
    ga: pick(i.ga, PATTERNS.ga),
    gtm: pick(i.gtm, PATTERNS.gtm),
    metaPixel: pick(i.metaPixel, PATTERNS.metaPixel),
    clarity: pick(i.clarity, PATTERNS.clarity),
  };
  const propertyId = i.tawk?.propertyId?.trim();
  const widgetId = i.tawk?.widgetId?.trim();
  const tawk =
    i.tawk?.enabled && propertyId && widgetId && PATTERNS.tawk.test(propertyId) && PATTERNS.tawk.test(widgetId)
      ? { propertyId, widgetId }
      : undefined;
  // The banner only has a job when there is a tracker to hold back.
  const askConsent = config.consent.enabled && Object.values(trackers).some(Boolean);
  return { trackers, tawk, askConsent };
}
