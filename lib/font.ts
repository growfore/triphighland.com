import { Archivo, IBM_Plex_Mono, Inter_Tight, Newsreader } from "next/font/google";

// Inter Tight carries body copy and UI. Archivo sets headings: bold at normal
// width for section titles, condensed via its width axis for hero titles.
// Newsreader is the light serif for kickers above titles. IBM Plex Mono is
// reserved for meta, prices and button labels.
export const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight",
  fallback: ["system-ui", "sans-serif"],
});

export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  fallback: ["Arial", "sans-serif"],
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-newsreader",
  fallback: ["Georgia", "serif"],
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  fallback: ["ui-monospace", "monospace"],
});
