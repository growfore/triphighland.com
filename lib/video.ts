// Shared by the trip page (server) and the video player (client).
export type Embed = { src: string; poster?: string };

// YouTube / Vimeo URL → privacy-friendly embed; anything else is ignored.
export function parseVideo(url?: string): Embed | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let yt: string | undefined;
  if (host === "youtu.be") yt = u.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    yt = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/)?.[1];
  }
  if (yt && /^[\w-]{6,20}$/.test(yt)) {
    return { src: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`, poster: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.match(/(\d{6,12})/)?.[1];
    if (id) return { src: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` };
  }
  return null;
}
