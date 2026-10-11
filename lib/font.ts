import { Inter_Tight, Montserrat, IBM_Plex_Mono, Caveat } from "next/font/google";

// Inter Tight carries body copy and UI; Montserrat Bold sets headings (300 is
// for the light <em> emphasis inside them). IBM Plex Mono is reserved for trip
// meta, prices and itinerary buttons (see the design style tile).
export const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight",
  fallback: ["system-ui", "sans-serif"],
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-montserrat",
  fallback: ["system-ui", "sans-serif"],
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  fallback: ["ui-monospace", "monospace"],
});

// Legacy face still imported by pre-redesign components (hero, carousel).
export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-script",
});
