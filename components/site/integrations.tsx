"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Ids are validated server-side before they reach here (see layout), since
// they are interpolated into inline scripts.
export type TrackerIds = { ga?: string; gtm?: string; metaPixel?: string; clarity?: string };
export type TawkIds = { propertyId: string; widgetId: string };

type Choice = "granted" | "denied";
const STORAGE_KEY = "cookie-consent";

// The saved choice as an external store: localStorage, with an in-memory
// fallback for when storage is blocked (the choice then lasts this visit).
const listeners = new Set<() => void>();
let memoryChoice: Choice | null = null;

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : memoryChoice;
  } catch {
    return memoryChoice;
  }
}

function saveChoice(choice: Choice) {
  memoryChoice = choice;
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* blocked storage: memoryChoice covers this visit */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Loads the dashboard's integrations. With the consent banner on, analytics
// and marketing tags (GA, GTM, Meta Pixel, Clarity) load only after "Accept";
// Tawk.to is a support chat and loads regardless.
export default function Integrations({
  trackers,
  tawk,
  consentRequired,
  policyHref,
}: {
  trackers: TrackerIds;
  tawk?: TawkIds;
  consentRequired: boolean;
  policyHref?: string;
}) {
  const hasTrackers = Boolean(trackers.ga || trackers.gtm || trackers.metaPixel || trackers.clarity);
  const askConsent = consentRequired && hasTrackers;
  // undefined on the server and during hydration, so nothing flashes.
  const saved = useSyncExternalStore(subscribe, readChoice, () => undefined);
  const choice = askConsent ? saved : "granted";
  const [reopened, setReopened] = useState(false);
  const bannerOpen = askConsent && (choice === null || reopened);

  // Footer "Cookie settings" reopens the banner.
  useEffect(() => {
    if (!askConsent) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest("[data-cookie-settings]")) {
        e.preventDefault();
        setReopened(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [askConsent]);

  const decide = (next: Choice) => {
    const wasGranted = choice === "granted";
    saveChoice(next);
    setReopened(false);
    // Tags already running can't be unloaded; a reload drops them.
    if (wasGranted && next === "denied") window.location.reload();
  };

  const granted = choice === "granted";

  return (
    <>
      {granted && <Trackers ids={trackers} />}
      {tawk && <Tawk ids={tawk} />}
      {askConsent && bannerOpen && <ConsentBanner onDecide={decide} policyHref={policyHref} />}
    </>
  );
}

function Trackers({ ids }: { ids: TrackerIds }) {
  // Meta Pixel's snippet tracks the first page view; client navigations need
  // their own (GA4 enhanced measurement and Clarity follow history changes).
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (ids.metaPixel) window.fbq?.("track", "PageView");
  }, [pathname, ids.metaPixel]);

  return (
    <>
      {ids.ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ids.ga}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ids.ga}');`}
          </Script>
        </>
      )}
      {ids.gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${ids.gtm}');`}
        </Script>
      )}
      {ids.metaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ids.metaPixel}');fbq('track','PageView');`}
        </Script>
      )}
      {ids.clarity && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${ids.clarity}");`}
        </Script>
      )}
    </>
  );
}

function Tawk({ ids }: { ids: TawkIds }) {
  // On a trip page, start the launcher above the peek card in the bottom-right. Tawk only reads
  // customStyle before it loads, so this follows the page the visit starts on.
  return (
    <Script id="tawk" strategy="lazyOnload">
      {`var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();if(location.pathname.indexOf("/trip/")===0){Tawk_API.customStyle={visibility:{desktop:{position:"br",xOffset:20,yOffset:175},mobile:{position:"br",xOffset:10,yOffset:140}}};}(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];s1.async=true;s1.src="https://embed.tawk.to/${ids.propertyId}/${ids.widgetId}";s1.charset="UTF-8";s1.setAttribute("crossorigin","*");s0.parentNode.insertBefore(s1,s0);})();`}
    </Script>
  );
}

function ConsentBanner({ onDecide, policyHref }: { onDecide: (c: Choice) => void; policyHref?: string }) {
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/15 bg-night text-paper shadow-[0_-20px_40px_-20px_rgba(0,0,0,.4)]"
    >
      <div className="wrap flex flex-wrap items-center justify-between gap-x-10 gap-y-4 py-5">
        <p className="max-w-[720px] text-[15px] font-light text-[#DCE5EE]">
          We use cookies to understand how the site is used and to improve your experience. Analytics only run if you accept.
          {policyHref && (
            <>
              {" "}
              <Link href={policyHref} className="text-paper underline underline-offset-4">
                Learn more
              </Link>
            </>
          )}
        </p>
        <div className="flex flex-none gap-3">
          <button type="button" onClick={() => onDecide("denied")} className="btn-outline-light min-h-11 px-6 py-2.5 text-[14px]">
            Decline
          </button>
          <button type="button" onClick={() => onDecide("granted")} className="btn-primary min-h-11 px-6 py-2.5 text-[14px]">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
