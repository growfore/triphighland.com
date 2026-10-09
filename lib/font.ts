import { Outfit, IBM_Plex_Mono, Caveat } from "next/font/google";

// Outfit carries the whole interface; IBM Plex Mono is reserved for trip meta,
// prices and itinerary buttons (see the design style tile).
export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
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
