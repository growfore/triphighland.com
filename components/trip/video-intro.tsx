"use client";

import { useState } from "react";
import { PlayIcon } from "lucide-react";
import Photo from "@/components/site/photo";
import { parseVideo } from "@/lib/video";

// Nothing from YouTube/Vimeo loads until the visitor presses play.
export default function VideoIntro({ url, title, fallbackPoster }: { url?: string; title: string; fallbackPoster?: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = parseVideo(url);
  if (!embed) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-night">
      {playing ? (
        <iframe
          src={embed.src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Play video: ${title}`}>
          {embed.poster ? (
            // External thumbnail; not worth routing through the image optimiser.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={embed.poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          ) : (
            <Photo src={fallbackPoster} alt="" sizes="(min-width: 1024px) 860px, 100vw" />
          )}
          <span className="absolute inset-0 bg-night/30 transition-colors group-hover:bg-night/40" />
          <span className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-night shadow-lg transition-transform group-hover:scale-105">
            <PlayIcon size={30} strokeWidth={1.8} fill="currentColor" className="translate-x-0.5" />
          </span>
        </button>
      )}
    </div>
  );
}
